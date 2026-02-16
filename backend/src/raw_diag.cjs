const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const db = mongoose.connection.db;
        const orders = await db.collection('orders').find({}).limit(2).toArray();
        console.log('Orders Count:', await db.collection('orders').countDocuments({}));
        console.log('Sample Order:', JSON.stringify(orders, null, 2));

        const products = await db.collection('products').find({}).limit(2).toArray();
        console.log('Products Count:', await db.collection('products').countDocuments({}));
        console.log('Sample Product:', JSON.stringify(products, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
