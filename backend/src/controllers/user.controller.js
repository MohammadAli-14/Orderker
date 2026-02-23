import { User } from "../models/user.model.js";

export async function addAddress(req, res) {
  try {
    const { label, fullName, streetAddress, city, state, zipCode, phoneNumber, isDefault } =
      req.body;

    const user = req.user;

    if (!fullName || !streetAddress || !city || !state || !zipCode) {
      return res.status(400).json({ error: "Missing required address fields" });
    }

    // if this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault: isDefault || false,
    });

    await user.save();

    res.status(201).json({ message: "Address added successfully", addresses: user.addresses });
  } catch (error) {
    console.error("Error in addAddress controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAddresses(req, res) {
  try {
    const user = req.user;

    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    console.error("Error in getAddresses controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateAddress(req, res) {
  try {
    const { label, fullName, streetAddress, city, state, zipCode, phoneNumber, isDefault } =
      req.body;

    const { addressId } = req.params;

    const user = req.user;
    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    // if this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    address.label = label || address.label;
    address.fullName = fullName || address.fullName;
    address.streetAddress = streetAddress || address.streetAddress;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.phoneNumber = phoneNumber || address.phoneNumber;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();

    res.status(200).json({ message: "Address updated successfully", addresses: user.addresses });
  } catch (error) {
    console.error("Error in updateAddress controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteAddress(req, res) {
  try {
    const { addressId } = req.params;
    const user = req.user;

    user.addresses.pull(addressId);
    await user.save();

    res.status(200).json({ message: "Address deleted successfully", addresses: user.addresses });
  } catch (error) {
    console.error("Error in deleteAddress controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function addToWishlist(req, res) {
  try {
    const { productId } = req.body;
    const user = req.user;

    // check if product is already in the wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ error: "Product already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({ message: "Product added to wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("Error in addToWishlist controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;
    const user = req.user;

    // check if product is already in the wishlist
    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({ error: "Product not found in wishlist" });
    }

    user.wishlist.pull(productId);
    await user.save();

    res.status(200).json({ message: "Product removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    console.error("Error in removeFromWishlist controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

import { Product } from "../models/product.model.js";
import { applyFlashSaleLogic } from "../utils/productUtils.js";

export async function getWishlist(req, res) {
  try {
    // we're using populate, bc wishlist is just an array of product ids
    // Explicitly mentioning model and selection to avoid any missing fields
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      model: "Product",
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const processedWishlist = await applyFlashSaleLogic(user.wishlist);
    res.status(200).json({ wishlist: processedWishlist });
  } catch (error) {
    console.error("Error in getWishlist controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function syncUserRole(req, res) {
  try {
    const user = req.user;
    const { ADMIN_EMAILS } = await import("../config/env.js").then((m) => m.ENV);
    const { clerkClient } = await import("../config/inngest.js");

    if (ADMIN_EMAILS.includes(user.email) && user.role !== "admin") {
      // 1. Update MongoDB
      user.role = "admin";
      await user.save();

      // 2. Update Clerk Metadata
      try {
        await clerkClient.users.updateUser(user.clerkId, {
          publicMetadata: { role: "admin" },
        });
      } catch (clerkError) {
        console.error("Failed to update Clerk metadata:", clerkError);
        // Continue even if Clerk fails, DB update might be enough for backend
      }

      return res.status(200).json({ message: "Role synced to admin", role: "admin" });
    }

    res.status(200).json({ message: "No role change needed", role: user.role });
  } catch (error) {
    console.error("Error in syncUserRole:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getProfile(req, res) {
  try {
    const user = req.user;
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getProfile controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, email, phoneNumber } = req.body;
    const user = req.user;

    // Reset verification if phone number is changed
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      user.isPhoneVerified = false;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
