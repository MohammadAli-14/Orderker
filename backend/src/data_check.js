import mongoose from 'mongoose';
import { Order } from './models/order.model.js';
import { Product } from './models/product.model.js';
import { ENV } from './config/env.js';

async function run() {
    try {
        console.log('Connecting to:', ENV.DB_URL);
        await mongoose.connect(ENV.DB_URL);
        console.log('Connected to DB');

        const orders = await Order.find({}).limit(5).lean();
        console.log('Sample Order user fields:', orders.map(o => o.user?.toString()));

        if (orders.length > 0) {
            const firstUserId = orders[0].user;
            const userExists = await mongoose.connection.db.collection('users').findOne({ _id: firstUserId });
            console.log(`Does first user ID ${firstUserId} exist in Users collection?`, !!userExists);
        }
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
        console.log('Full Aggregation Result (Sold Data):', JSON.stringify(soldData.slice(0, 3), null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Data Check error:', err);
        process.exit(1);
    }
}

run();
