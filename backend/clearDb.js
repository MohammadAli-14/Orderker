import mongoose from 'mongoose';
import { ENV } from './src/config/env.js';
import { WhatsAppAuth } from './src/models/whatsapp-auth.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function clear() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected");
        await WhatsAppAuth.deleteMany({});
        console.log("Cleared whatsappauths successfully!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
clear();
