import { User } from "./src/models/user.model.js";
import { connectDB } from "./src/config/db.js";
import mongoose from "mongoose";

const migrateCustomers = async () => {
    try {
        await connectDB();
        console.log("Checking for users without a role...");

        // Find users who have NO role field at all
        const result = await User.updateMany(
            { role: { $exists: false } }, // Query: Role field is missing
            { $set: { role: "user" } }    // Update: Set it to 'user'
        );

        console.log(`Updated ${result.modifiedCount} existing users to 'user' role.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrateCustomers();
