import mongoose from 'mongoose';
import { Order } from './models/order.model.js';
import { Product } from './models/product.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const orderCount = await Order.countDocuments({});
        console.log('Total Orders:', orderCount);

        const orders = await Order.find({}).limit(2).lean();
        console.log('Sample Orders:', JSON.stringify(orders, null, 2));

        // Test the exact aggregation from analytics.controller.js
        const soldData = await Order.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    totalSold: { $sum: "$orderItems.quantity" },
                    revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
                },
            },
        ]);
        console.log('Aggregation Result (Sold Data):', JSON.stringify(soldData, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Diagnostic error:', err);
        process.exit(1);
    }
}

run();
