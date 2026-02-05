import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import { User } from "../models/user.model.js";
import { ENV } from "./env.js";

export const inngest = new Inngest({ id: "ecommerce-app" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const email = email_addresses[0]?.email_address;

    const newUser = {
      clerkId: id,
      email,
      name: `${first_name || ""} ${last_name || ""}` || "User",
      imageUrl: image_url,
      role: ENV.ADMIN_EMAILS.includes(email) ? "admin" : "user",
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
