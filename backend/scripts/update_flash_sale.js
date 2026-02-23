import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FlashSale } from '../src/models/flashSale.model.js';

dotenv.config();

const connectDB = async () => {
    try {
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
        const sale = await FlashSale.findOne({ title: "Ramadan Flash Sale" });

        if (!sale) {
            console.log('Flash Sale not found!');
            process.exit(1);
        }

        console.log(`Found Sale: ${sale.title}, Status: ${sale.status}, Ends: ${sale.endTime}`);

        // Update to end in 24 hours from now
        const newEndTime = new Date();
        newEndTime.setDate(newEndTime.getDate() + 1); // Add 1 day

        sale.endTime = newEndTime;
        sale.status = "ACTIVE";

        await sale.save();

        console.log(`✅ Sale Updated! New Status: ${sale.status}, New End Time: ${sale.endTime}`);

    } catch (error) {
        console.error('Error updating sale:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

updateFlashSale();
