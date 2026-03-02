import { notificationService } from "../services/notification.service.js";
import { User } from "../models/user.model.js";
import { whatsappService } from "../services/whatsapp.service.js";

const OTP_WINDOW_MS = 15 * 60 * 1000;
const OTP_MAX_REQUESTS = 5;
const OTP_MIN_INTERVAL_MS = 45 * 1000;
const whatsappCodeRequestTracker = new Map();

function trackAndValidateWhatsAppCodeRequest(userId) {
    const now = Date.now();
    const tracker = whatsappCodeRequestTracker.get(userId) || {
        requests: [],
        lastRequestAt: 0,
    };

    const requestsInWindow = tracker.requests.filter((timestamp) => now - timestamp < OTP_WINDOW_MS);

    if (tracker.lastRequestAt && now - tracker.lastRequestAt < OTP_MIN_INTERVAL_MS) {
        return {
            allowed: false,
            error: "Please wait before requesting another verification code.",
            retryAfterSeconds: Math.ceil((OTP_MIN_INTERVAL_MS - (now - tracker.lastRequestAt)) / 1000),
        };
    }

    if (requestsInWindow.length >= OTP_MAX_REQUESTS) {
        const oldestInWindow = requestsInWindow[0];
        return {
            allowed: false,
            error: "Too many verification attempts. Please try again later.",
            retryAfterSeconds: Math.ceil((OTP_WINDOW_MS - (now - oldestInWindow)) / 1000),
        };
    }

    requestsInWindow.push(now);
    whatsappCodeRequestTracker.set(userId, {
        requests: requestsInWindow,
        lastRequestAt: now,
    });

    return { allowed: true };
}

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

        const rateLimitResult = trackAndValidateWhatsAppCodeRequest(user._id.toString());
        if (!rateLimitResult.allowed) {
            return res.status(429).json({
                error: rateLimitResult.error,
                retryAfterSeconds: rateLimitResult.retryAfterSeconds,
            });
        }

        const botStatus = whatsappService.getStatus().status;
        if (botStatus !== "connected") {
            return res.status(503).json({
                error: "WhatsApp verification service is temporarily unavailable. Please try again shortly."
            });
        }

        // Clear previous errors, but do NOT update phone number until verified!
        user.lastVerificationError = "";
        await user.save();

        const result = await notificationService.getWhatsAppCode(cleanPhone, user._id);
        res.status(200).json(result);

    } catch (error) {
        console.error("Error in requestWhatsAppCode:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
