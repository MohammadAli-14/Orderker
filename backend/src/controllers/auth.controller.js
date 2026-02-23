import { notificationService } from "../services/notification.service.js";
import { User } from "../models/user.model.js";

export async function sendVerificationCode(req, res) {
    try {
        const { phoneNumber } = req.body;
        const user = req.user; // From clerkMiddleware

        if (!phoneNumber) {
            return res.status(400).json({ error: "Phone number is required" });
        }

        // Optional: Update user's phone number if different
        if (user.phoneNumber !== phoneNumber) {
            user.phoneNumber = phoneNumber;
            user.isPhoneVerified = false;
            await user.save();
        }

        const result = await notificationService.sendOTP(phoneNumber);
        res.status(200).json(result);

    } catch (error) {
        console.error("Error in sendVerificationCode:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function verifyPhoneNumber(req, res) {
    try {
        const { phoneNumber, code } = req.body;
        const user = req.user;

        if (!phoneNumber || !code) {
            return res.status(400).json({ error: "Phone number and code are required" });
        }

        const isValid = await notificationService.verifyOTP(phoneNumber, code);

        if (isValid) {
            user.isPhoneVerified = true;
            user.phoneNumber = phoneNumber; // Ensure it's synced
            await user.save();
            return res.status(200).json({ success: true, message: "Phone number verified successfully" });
        } else {
            return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
        }

    } catch (error) {
        console.error("Error in verifyPhoneNumber:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
export async function requestWhatsAppCode(req, res) {
    try {
        const { phoneNumber } = req.body;
        const user = req.user;

        if (!phoneNumber) {
            return res.status(400).json({ error: "Phone number is required" });
        }

        // Strict Pakistani Number Validation
        const cleanPhone = phoneNumber.replace(/\s+/g, "");
        const pakRegex = /^(03[0-9]{9}|923[0-9]{9}|\+923[0-9]{9})$/;

        if (!pakRegex.test(cleanPhone)) {
            return res.status(400).json({
                error: "Invalid Pakistani number format. Use 03XX-XXXXXXX or 923XX-XXXXXXX."
            });
        }

        // Clear previous errors, but do NOT update phone number until verified!
        user.lastVerificationError = "";
        await user.save();

        const result = await notificationService.getWhatsAppCode(phoneNumber, user._id);
        res.status(200).json(result);

    } catch (error) {
        console.error("Error in requestWhatsAppCode:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
