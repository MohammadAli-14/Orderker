import { createClerkClient } from "@clerk/backend";
import { ENV } from "./src/config/env.js";
import dotenv from "dotenv";

dotenv.config();

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const syncClerkMetadata = async () => {
    try {
        console.log("Fetching users from Clerk...");
        const userList = await clerkClient.users.getUserList();
        const users = userList.data;

        console.log(`Found ${users.length} users in Clerk.`);
        console.log("Admin Emails:", ENV.ADMIN_EMAILS);

        for (const user of users) {
            const email = user.emailAddresses[0]?.emailAddress;
            if (ENV.ADMIN_EMAILS.includes(email)) {
                console.log(`Updating metadata for Admin: ${email}`);
                await clerkClient.users.updateUser(user.id, {
                    publicMetadata: { role: "admin" },
                });
                console.log("✅ Success");
            } else {
                // Optional: Ensure non-admins have 'user' role
                if (user.publicMetadata.role !== "admin") {
                    console.log(`Ensuring 'user' role for: ${email}`);
                    await clerkClient.users.updateUser(user.id, {
                        publicMetadata: { role: "user" },
                    });
                }
            }
        }

        console.log("Metadata sync complete.");
    } catch (error) {
        console.error("Sync failed:", error);
    }
};

syncClerkMetadata();
