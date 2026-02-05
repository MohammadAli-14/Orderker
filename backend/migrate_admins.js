import { User } from "./src/models/user.model.js";
import { ENV } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";
import mongoose from "mongoose";

const migrateAdmins = async () => {
    try {
        await connectDB();
        console.log("Checking for existing admins to update...");

        const result = await User.updateMany(
            { email: { $in: ENV.ADMIN_EMAILS } },
            { $set: { role: "admin" } }
        );

        console.log(`Updated ${result.modifiedCount} users to admin role.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrateAdmins();
