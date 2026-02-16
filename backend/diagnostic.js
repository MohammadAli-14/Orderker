import mongoose from 'mongoose';
import { Order } from './src/models/order.model.js';
import { Product } from './src/models/product.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const orders = await Order.find({}).limit(5).lean();
        console.log('Sample Orders:', JSON.stringify(orders, null, 2));

        const products = await Product.find({}).limit(5).lean();
        console.log('Sample Products:', JSON.stringify(products, null, 2));

        // Test aggregation
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
        console.log('Aggregation Result:', JSON.stringify(soldData, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
