import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FlashSale } from './src/models/flashSale.model.js';

dotenv.config();

console.log('Starting script...');

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing from env');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const updateFlashSale = async () => {
    await connectDB();

    try {
        console.log('Searching for Flash Sale...');
        const sale = await FlashSale.findOne({ title: "Ramadan Flash Sale" });

        if (!sale) {
            console.log('Flash Sale "Ramadan Flash Sale" not found!');
            const allSales = await FlashSale.find({}, 'title status');
            console.log('Available Sales:', allSales);
            process.exit(1);
        }

        console.log(`Found: ${sale.title}, Ends: ${sale.endTime}`);

        // Update to end in 24 hours from now
        const newEndTime = new Date();
        newEndTime.setDate(newEndTime.getDate() + 1);

        sale.endTime = newEndTime;
        sale.status = "ACTIVE";

        await sale.save();

        console.log(`✅ Success! New End Time: ${sale.endTime}`);

    } catch (error) {
        console.error('Error updating sale:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
        process.exit(0);
    }
};

updateFlashSale();
