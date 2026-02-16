import { Router } from "express";
import {
  addAddress,
  addToWishlist,
  deleteAddress,
  getAddresses,
  getWishlist,
  removeFromWishlist,
  updateAddress,
  syncUserRole,
  getProfile,
  updateProfile,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

// profile routes
router.get("/me", getProfile);
router.put("/me", updateProfile);

// address routes
router.post("/addresses", addAddress);
router.get("/addresses", getAddresses);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

// wishlist routes
router.post("/wishlist", addToWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);
router.get("/wishlist", getWishlist);

router.get("/wishlist", getWishlist);
router.post("/sync-role", syncUserRole);

export default router;
