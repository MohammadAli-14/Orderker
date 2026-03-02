import { VerificationRequest } from "../models/verification-request.model.js";
import { randomInt } from "crypto";

export class NotificationService {
    constructor() {
        this.otpStore = new Map(); // Keep for simple OTP flow if needed, but WhatsApp now uses DB
    }

    generateOTP() {
        return randomInt(100000, 1000000).toString();
    }

    async sendOTP(phoneNumber) {
        const otp = this.generateOTP();

        // Store OTP with expiry (5 minutes)
        this.otpStore.set(phoneNumber, {
            code: otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        });

        console.log(`[NotificationService] 🔐 OTP for ${phoneNumber}: ${otp}`);
        return { success: true, message: "OTP sent successfully (Simulated)" };
    }

    async verifyOTP(phoneNumber, code) {
        const record = this.otpStore.get(phoneNumber);
        if (!record) return false;
        if (Date.now() > record.expiresAt) {
            this.otpStore.delete(phoneNumber);
            return false;
        }
        if (record.code === code) {
            this.otpStore.delete(phoneNumber);
            return true;
        }
        return false;
    }

    async getWhatsAppCode(phoneNumber, userId) {
        const otp = this.generateOTP();

        // Persistent storage in MongoDB
        await VerificationRequest.deleteMany({ phoneNumber }); // Clear old pending for this phone

        await VerificationRequest.create({
            phoneNumber,
            code: otp,
            userId,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes for WhatsApp
        });

        if (process.env.NODE_ENV !== "production") {
            console.log(`[NotificationService] 📱 Generated Persistent WhatsApp Verification for ${phoneNumber} (User: ${userId}): ${otp}`);
        }
        return { success: true, code: otp };
    }

    async verifyByCode(code, senderPhoneLast10, isLid = false) {
        // Find the request by code
        const request = await VerificationRequest.findOne({ code });

        if (!request) {
            console.log(`[NotificationService] ❌ Verification code "${code}" not found in database.`);
            return null;
        }

        if (new Date() > request.expiresAt) {
            await VerificationRequest.deleteOne({ _id: request._id });
            throw new Error("EXPIRED");
        }

        // SECURITY CHECK: 
        // 1. If it's a standard JID (phone number), it MUST match the last 10 digits.
        const registeredLast10 = request.phoneNumber.replace(/\D/g, "").slice(-10);

        if (!isLid && registeredLast10 !== senderPhoneLast10) {
            console.log(`[NotificationService] ⚠️ Security Mismatch! Code ${code} matches ${request.phoneNumber}, but sender was ${senderPhoneLast10}`);
            throw new Error("NUMBER_MISMATCH");
        }

        // If all good, consume it and return data
        const result = { phoneNumber: request.phoneNumber, userId: request.userId };
        await VerificationRequest.deleteOne({ _id: request._id });

        return result;
    }
}

export const notificationService = new NotificationService();
