import mongoose from "mongoose";
import { Product } from "./src/models/product.model.js";
import { Order } from "./src/models/order.model.js";
import { ENV } from "./src/config/env.js";

async function run() {
    try {
        await mongoose.connect(ENV.DB_URL);
        console.log("Connected to DB");

        const products = await Product.find({}).lean();
        const productMap = new Map(products.map(p => [p._id.toString(), p]));
        const productNameMap = new Map(products.map(p => [p.name.toLowerCase().trim(), p]));

        const soldData = await Order.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    name: { $first: "$orderItems.name" },
                    totalSold: { $sum: "$orderItems.quantity" },
                },
            },
        ]);

        console.log("\n--- Verification Report ---");
        let matchedCount = 0;
        let ghostCount = 0;
        let mergedCount = 0;

        for (const sold of soldData) {
            const idStr = sold._id?.toString();
            const normalizedName = sold.name?.toLowerCase().trim();
            const exists = productMap.has(idStr);
            const nameExists = productNameMap.get(normalizedName);

            if (exists) {
                matchedCount++;
                // console.log(`[MATCH] ${sold.name} (ID: ${idStr})`);
            } else if (nameExists) {
                mergedCount++;
                console.log(`[MERGE SUCCESS] Found match for stale item: "${sold.name}" -> Now matches ID: ${nameExists._id}`);
            } else {
                ghostCount++;
                console.log(`[GHOST] Truly deleted: "${sold.name}" (ID: ${idStr})`);
            }
        }

        console.log("\nSummary:");
        console.log(`- Exact ID matches: ${matchedCount}`);
        console.log(`- Name-matching merges: ${mergedCount}`);
        console.log(`- Remaining ghost products: ${ghostCount}`);

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
