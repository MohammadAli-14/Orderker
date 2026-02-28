import mongoose from "mongoose";
import { User } from "./src/models/user.model.js";
import { connectDB } from "./src/config/db.js";
import { ENV } from "./src/config/env.js";

const cleanupLids = async () => {
    try {
        console.log("🚀 Starting WhatsApp LID Cleanup...");
        await connectDB();

        // Find all users where whatsappLid is an empty string
        const usersToFix = await User.find({ whatsappLid: "" });
        console.log(`🔍 Found ${usersToFix.length} users with empty WhatsApp LIDs.`);

        if (usersToFix.length > 0) {
            for (const user of usersToFix) {
                // Remove the field or set to undefined so sparse index ignores it
                user.whatsappLid = undefined;
                await user.save();
                console.log(`✅ Fixed user: ${user.name} (${user.email})`);
            }
            console.log("🎉 All problematic LIDs have been cleaned up!");
        } else {
            console.log("✨ No problematic LIDs found. Database is already clean.");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Cleanup failed:", error);
        process.exit(1);
    }
};

cleanupLids();
