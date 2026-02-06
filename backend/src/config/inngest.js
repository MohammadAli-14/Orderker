import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import { User } from "../models/user.model.js";
import { ENV } from "./env.js";

export const inngest = new Inngest({ id: "ecommerce-app" });

import { createClerkClient } from "@clerk/backend";

export const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const email = email_addresses[0]?.email_address;
    const role = ENV.ADMIN_EMAILS.includes(email) ? "admin" : "user";

    // Write role to Clerk Metadata so frontend can see it instantly
    await clerkClient.users.updateUser(id, {
      publicMetadata: { role },
    });

    const newUser = {
      clerkId: id,
      email,
      name: `${first_name || ""} ${last_name || ""}` || "User",
      imageUrl: image_url,
      role,
      addresses: [],
      wishlist: [],
    };

    await User.create(newUser);
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;
    await User.deleteOne({ clerkId: id });
  }
);

export const functions = [syncUser, deleteUserFromDB];
