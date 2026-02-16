import dotenv from "dotenv";
import mongoose from "mongoose";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Initialize dotenv manually since we're outside src/
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URL);
        console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
    } catch (error) {
        console.error("💥 MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

const clearOrders = async () => {
    await connectDB();

    try {
        // We need to define models or assume they are registered if we imported them.
        // But since we are in a standalone script, let's just use the collection names directly via mongoose.connection
        // This avoids model definition duplication issues.

        const db = mongoose.connection.db;

        console.log("🔥 Clearing 'orders' collection...");
        const ordersResult = await db.collection("orders").deleteMany({});
        console.log(`   Deleted ${ordersResult.deletedCount} orders.`);

        console.log("🔥 Clearing 'reviews' collection (linked to orders)...");
        const reviewsResult = await db.collection("reviews").deleteMany({});
        console.log(`   Deleted ${reviewsResult.deletedCount} reviews.`);

        console.log("\n✨ Database cleared successfully! Ready for fresh start.");
    } catch (error) {
        console.error("❌ Error clearing database:", error);
    } finally {
        await mongoose.disconnect();
        console.log("👋 Disconnected from MongoDB.");
        process.exit(0);
    }
};

clearOrders();
