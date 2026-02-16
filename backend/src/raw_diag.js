import mongoose from 'mongoose';
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

        const db = mongoose.connection.db;
        const ordersColl = db.collection('orders');
        const productsColl = db.collection('products');

        const orderCount = await ordersColl.countDocuments({});
        console.log('Total Orders Count:', orderCount);

        const sampleOrders = await ordersColl.find({}).limit(1).toArray();
        console.log('Sample Order:', JSON.stringify(sampleOrders, null, 2));

        const sampleProducts = await productsColl.find({}).limit(1).toArray();
        console.log('Sample Product:', JSON.stringify(sampleProducts, null, 2));

        // Let's also check the fields names in orderItems
        if (sampleOrders.length > 0 && sampleOrders[0].orderItems) {
            console.log('OrderItems Keys:', Object.keys(sampleOrders[0].orderItems[0]));
        }

        process.exit(0);
    } catch (err) {
        console.error('Raw Diagnostic error:', err);
        process.exit(1);
    }
}

run();
