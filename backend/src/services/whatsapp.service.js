import { makeWASocket, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from "@whiskeysockets/baileys";
import { USyncQuery } from "@whiskeysockets/baileys/lib/WAUSync/USyncQuery.js";
import { USyncUser } from "@whiskeysockets/baileys/lib/WAUSync/USyncUser.js";
import { Boom } from "@hapi/boom";
import qrcodeTerminal from "qrcode-terminal";
import QRCode from "qrcode";
import pino from "pino";
import { WhatsAppAuth } from "../models/whatsapp-auth.model.js";
import { User } from "../models/user.model.js";
import fs from "fs";
import path from "path";
import { notificationService } from "./notification.service.js";
import { useMongoDBAuthState } from "./useMongoDBAuthState.js";

// Connection status constants
const STATUS = {
    DISCONNECTED: "disconnected",
    CONNECTING: "connecting",
    WAITING_QR: "waiting_qr",
    CONNECTED: "connected",
    STOPPED: "stopped",
};

// Reconnect configuration
const RECONNECT = {
    BASE_DELAY: 5000,
    MAX_DELAY: 30000,
    MAX_QR_TIMEOUTS: 5,
    MAX_440_RETRIES: 3,
    BACKOFF_MULTIPLIER: 2,
};

class WhatsAppService {
    constructor() {
        this.sock = null;
        this.logger = pino({ level: "silent" });
        this.isShuttingDown = false;

        // Production state tracking
        this.status = STATUS.DISCONNECTED;
        this.lastQrBase64 = null;
        this.lastQrTimestamp = null;
        this.qrTimeoutCount = 0;
        this.reconnectAttempts = 0;
        this.conflict440Count = 0;
        this.connectedAt = null;
        this.lastError = null;
        this.stableResetTimer = null;
    }

    getStatus() {
        return {
            status: this.status,
            connectedAt: this.connectedAt,
            qrAvailable: !!this.lastQrBase64,
            qrTimeoutCount: this.qrTimeoutCount,
            reconnectAttempts: this.reconnectAttempts,
            lastError: this.lastError,
            uptime: this.connectedAt
                ? Math.floor((Date.now() - this.connectedAt) / 1000)
                : null,
        };
    }

    getQrCode() {
        if (!this.lastQrBase64) return null;
        return {
            qr: this.lastQrBase64,
            timestamp: this.lastQrTimestamp,
            expiresIn: 20,
        };
    }

    getReconnectDelay() {
        const delay = Math.min(
            RECONNECT.BASE_DELAY * Math.pow(RECONNECT.BACKOFF_MULTIPLIER, this.reconnectAttempts),
            RECONNECT.MAX_DELAY
        );
        return delay;
    }

    // Destroy old socket completely before creating a new one
    destroySocket() {
        if (this.sock) {
            try {
                this.sock.ev.removeAllListeners();
                this.sock.ws.close();
                this.sock.end(undefined);
            } catch (err) {
                // socket already dead, safe to ignore
            }
            this.sock = null;
        }
    }

    async init() {
        if (this.isShuttingDown) return;

        // CRITICAL: destroy old socket first to prevent 440 (Connection Replaced)
        this.destroySocket();

        this.status = STATUS.CONNECTING;
        this.lastQrBase64 = null;
        console.log("[WhatsAppService] 🚀 Initializing WhatsApp Bot...");

        const { state, saveCreds } = await useMongoDBAuthState("default");
        const { version } = await fetchLatestBaileysVersion();

        this.sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, this.logger),
            },
            logger: this.logger,
            browser: ["OrderKer Bot", "Chrome", "4.0.0"],
            syncFullHistory: false,
            patchMessageBeforeSending: (message) => {
                const requiresPatch = !!(
                    message.buttonsMessage ||
                    message.templateMessage ||
                    message.listMessage
                );
                if (requiresPatch) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadata: {},
                                    deviceListMetadataVersion: 2,
                                },
                                ...message,
                            },
                        },
                    };
                }
                return message;
            }
        });

        this.sock.ev.on("creds.update", async () => {
            await saveCreds();
        });

        this.sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                this.status = STATUS.WAITING_QR;
                this.lastQrTimestamp = Date.now();
                console.log("[WhatsAppService] 📲 QR Code updated!");

                // Generate base64 for remote API access
                try {
                    this.lastQrBase64 = await QRCode.toDataURL(qr);
                } catch (err) {
                    console.error("[WhatsAppService] ❌ Failed to generate QR base64:", err);
                }

                // Print in terminal (fallback for local dev)
                qrcodeTerminal.generate(qr, { small: true });

                // Save as PNG file (fallback)
                try {
                    const qrPath = path.join(process.cwd(), "whatsapp_qr.png");
                    await QRCode.toFile(qrPath, qr);
                    console.log(`[WhatsAppService] 🖼️  QR Code saved as image: backend/whatsapp_qr.png`);
                    console.log("[WhatsAppService] 💡 TIP: If the terminal QR is hard to scan, open 'whatsapp_qr.png' in your folder and scan that!");
                } catch (err) {
                    console.error("[WhatsAppService] ❌ Failed to save QR image:", err);
                }
            }

            if (connection === "close") {
                const statusCode = (lastDisconnect?.error instanceof Boom)
                    ? lastDisconnect.error.output.statusCode
                    : 0;

                this.status = STATUS.DISCONNECTED;
                this.lastQrBase64 = null;
                this.connectedAt = null;
                this.lastError = `Connection closed (Status: ${statusCode})`;

                console.log(`[WhatsAppService] 🔌 Connection closed (Status: ${statusCode})`);

                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                if (shouldReconnect && !this.isShuttingDown) {
                    // Track QR timeouts (408 = Request Timeout i.e. nobody scanned QR)
                    if (statusCode === 408) {
                        this.qrTimeoutCount++;
                        console.log(`[WhatsAppService] ⏱️  QR timeout ${this.qrTimeoutCount}/${RECONNECT.MAX_QR_TIMEOUTS}`);

                        if (this.qrTimeoutCount >= RECONNECT.MAX_QR_TIMEOUTS) {
                            this.status = STATUS.STOPPED;
                            this.lastError = `Stopped: QR not scanned after ${RECONNECT.MAX_QR_TIMEOUTS} attempts. Use /api/whatsapp/restart to retry.`;
                            console.log(`[WhatsAppService] 🛑 Max QR timeouts reached. Bot stopped. Use admin API to restart.`);
                            return;
                        }
                    }

                    // Track 440 errors (Connection Replaced / Conflict)
                    if (statusCode === 440) {
                        this.conflict440Count++;
                        console.log(`[WhatsAppService] ⚠️ 440 Conflict attempt ${this.conflict440Count}/${RECONNECT.MAX_440_RETRIES}`);

                        if (this.conflict440Count >= RECONNECT.MAX_440_RETRIES) {
                            this.status = STATUS.STOPPED;
                            this.lastError = `Stopped: Session conflict (440) after ${RECONNECT.MAX_440_RETRIES} retries. Session may be used elsewhere. Clear session and re-scan QR.`;
                            console.log(`[WhatsAppService] 🛑 Max 440 retries reached. Possible causes:`);
                            console.log(`    1. WhatsApp Web is open in a browser (close it)`);
                            console.log(`    2. Another server instance is running with same session`);
                            console.log(`    3. Session is corrupt — use /api/whatsapp/restart`);
                            return;
                        }
                    } else {
                        this.reconnectAttempts++;
                    }
                    const delay = this.getReconnectDelay();
                    console.log(`[WhatsAppService] 🔄 Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts})...`);
                    setTimeout(() => this.init(), delay);
                } else if (!shouldReconnect) {
                    console.log("[WhatsAppService] ❌ Logged out. Clearing session...");
                    await this.clearSession();
                    this.qrTimeoutCount = 0;
                    this.reconnectAttempts = 0;
                    if (!this.isShuttingDown) {
                        console.log("[WhatsAppService] 🔄 Restarting with fresh session in 5s...");
                        setTimeout(() => this.init(), 5000);
                    }
                }
            } else if (connection === "open") {
                // SUCCESS: Reset general counters (but NOT conflict440Count immediately)
                this.status = STATUS.CONNECTED;
                this.connectedAt = Date.now();
                this.lastQrBase64 = null;
                this.qrTimeoutCount = 0;
                this.reconnectAttempts = 0;
                this.lastError = null;
                console.log("[WhatsAppService] ✅ WhatsApp Bot is ONLINE!");

                // Only reset 440 counter after 5 minutes of stable connection
                if (this.stableResetTimer) clearTimeout(this.stableResetTimer);
                this.stableResetTimer = setTimeout(() => {
                    if (this.status === STATUS.CONNECTED) {
                        this.conflict440Count = 0;
                        console.log("[WhatsAppService] ✅ Stable for 5 min — 440 counter reset.");
                    }
                }, 5 * 60 * 1000);;
            }
        });

        this.sock.ev.on("messages.upsert", async (m) => {
            const msg = m.messages[0];
            if (!msg.key.fromMe && m.type === "notify") {
                const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
                if (text && text.startsWith("VERIFY:")) {
                    const code = text.split("VERIFY:")[1].trim();
                    const jid = msg.key.remoteJid;
                    await this.handleVerification(msg.key.remoteJid, code);
                }
            }
        });
    }

    async restart() {
        console.log("[WhatsAppService] 🔃 Admin-triggered restart...");
        this.isShuttingDown = false;
        this.qrTimeoutCount = 0;
        this.conflict440Count = 0;
        this.reconnectAttempts = 0;
        this.lastError = null;
        this.status = STATUS.DISCONNECTED;

        this.destroySocket();

        // Small delay to let socket fully close
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.init();
    }

    async handleVerification(jid, code) {
        const fromRaw = jid.split("@")[0];
        const isLid = jid.endsWith("@lid");

        console.log(`[WhatsAppService] 📥 Received verification: ${code} from ${fromRaw} (${isLid ? "LID" : "PN"})`);

        try {
            // 1. Normalize identifying numbers
            const senderPhoneRaw = fromRaw.replace(/\D/g, "");
            const senderPhoneLast10 = isLid ? "" : senderPhoneRaw.slice(-10);

            // 2. Try Code-First Lookup! 
            let verifiedData;
            try {
                verifiedData = await notificationService.verifyByCode(code, senderPhoneLast10, isLid);

                if (!verifiedData) {
                    await this.sock.sendMessage(jid, {
                        text: `❌ Verification code "${code}" not found or already used. Please request a new one in the app.`
                    });
                    return;
                }

                const { phoneNumber: targetPhone, userId } = verifiedData;
                const user = await User.findById(userId);

                if (!user) {
                    console.log(`[WhatsAppService] ❌ User Session Missing: ${userId}`);
                    await this.sock.sendMessage(jid, { text: `❌ Could not find a matching user session for this code.` });
                    return;
                }

                console.log(`[WhatsAppService] 👤 Code match found for user ${user.name} (${targetPhone})`);

                // --- AUTHORITATIVE IDENTITY RESOLUTION ---
                const normalizedDigits = this.normalizeToDigits(targetPhone);
                console.log(`[WhatsAppService] 🔍 Resolving Identity (Digits): ${targetPhone} -> ${normalizedDigits}...`);

                const resolution = await Promise.race([
                    this.sock.onWhatsApp(normalizedDigits),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("RESOLUTION_TIMEOUT")), 15000))
                ]).catch(err => {
                    console.error(`[WhatsAppService] ❌ JID Resolution failed for ${normalizedDigits}:`, err.message);
                    return null;
                });

                if (!resolution || !resolution[0] || !resolution[0].exists) {
                    const failMsg = !resolution
                        ? "WhatsApp identity check timed out. Please try again in a few moments."
                        : `The number ${targetPhone} does not have a WhatsApp account.`;

                    user.lastVerificationError = failMsg;
                    await user.save();

                    console.log(`[WhatsAppService] ⚠️ Identity resolution failed for ${normalizedDigits}. Reason: ${failMsg}`);
                    await this.sock.sendMessage(jid, { text: `❌ ${failMsg}` });
                    return;
                }

                const resolvedJid = resolution[0].jid;
                console.log(`[WhatsAppService] ✅ Resolved: ${targetPhone} -> ${resolvedJid}. Sender: ${jid}`);

                // --- OWNERSHIP VERIFICATION ---
                if (isLid) {
                    console.log(`[WhatsAppService] 🔐 LID sender detected. Resolving LID for ${resolvedJid}...`);
                    const typedNumberLid = await this.resolveLidForPN(resolvedJid);

                    if (!typedNumberLid) {
                        console.log(`[WhatsAppService] ⚠️ Could not resolve LID for ${resolvedJid}. Rejecting (fail-safe).`);
                        user.lastVerificationError = "Could not verify ownership. Please try again.";
                        await user.save();
                        await this.sock.sendMessage(jid, { text: `❌ Could not verify ownership of ${targetPhone}. Please try again in a moment.` });
                        return;
                    }

                    const senderLidRaw = fromRaw;
                    const typedLidRaw = typedNumberLid.split("@")[0];
                    console.log(`[WhatsAppService] 🔍 LID Comparison: Sender=${senderLidRaw}, TypedNumber=${typedLidRaw}`);

                    if (senderLidRaw !== typedLidRaw) {
                        console.log(`[WhatsAppService] 🛡️ LID MISMATCH: Sender LID ${senderLidRaw} ≠ Typed Number LID ${typedLidRaw}`);
                        user.lastVerificationError = "Ownership mismatch: This number belongs to a different WhatsApp account.";
                        await user.save();
                        await this.sock.sendMessage(jid, {
                            text: `❌ Security Alert: The number ${targetPhone} belongs to a different WhatsApp account. Please type YOUR OWN number in the app.`
                        });
                        return;
                    }

                    console.log(`[WhatsAppService] ✅ LID ownership confirmed: ${senderLidRaw} === ${typedLidRaw}`);
                } else {
                    if (jid !== resolvedJid) {
                        console.log(`[WhatsAppService] 🛡️ OWNERSHIP MISMATCH: Sender ${jid} tried to verify ${targetPhone} (Owner: ${resolvedJid})`);
                        user.lastVerificationError = "Ownership mismatch: Use your correct WhatsApp";
                        await user.save();
                        await this.sock.sendMessage(jid, {
                            text: `❌ Security Alert: You tried to verify ${targetPhone}, but you are sending from a different WhatsApp account.\n\nPlease type YOUR official number in the app.`
                        });
                        return;
                    }
                    console.log(`[WhatsAppService] ✅ PN ownership confirmed: ${jid} === ${resolvedJid}`);
                }

                // --- OFFICIAL OWNERSHIP CHECK (Identity Locking) ---
                if (user.whatsappLid && user.whatsappLid !== fromRaw) {
                    user.lastVerificationError = "Account already locked to another WhatsApp";
                    await user.save();
                    console.log(`[WhatsAppService] 🛡️ LID LOCK: User ${user.name} tried to switch LID from ${user.whatsappLid} to ${fromRaw}`);
                    await this.sock.sendMessage(jid, { text: `❌ Your account is already linked to a different WhatsApp. Use your original account.` });
                    return;
                }

                if (isLid) {
                    const existingLidOwner = await User.findOne({ whatsappLid: fromRaw });
                    if (existingLidOwner && existingLidOwner._id.toString() !== user._id.toString()) {
                        user.lastVerificationError = "WhatsApp belongs to another user";
                        await user.save();
                        console.log(`[WhatsAppService] 🛡️ CROSS-USER: LID ${fromRaw} already belongs to ${existingLidOwner.name}`);
                        await this.sock.sendMessage(jid, {
                            text: `❌ Your WhatsApp is already linked to another person (${existingLidOwner.name}).`
                        });
                        return;
                    }
                }

                // --- ALL CHECKS PASSED: OFFICIALLY VERIFY ---
                console.log(`[WhatsAppService] 🎖️ Final verification success for ${user.name}`);
                user.phoneNumber = targetPhone;
                user.isPhoneVerified = true;
                user.lastVerificationError = "";

                if (isLid) {
                    user.whatsappLid = fromRaw;
                }

                await user.save();

                await this.sock.sendMessage(jid, {
                    text: `✅ Success! Your OrderKer account (${user.name}) is now officially verified for ${targetPhone}.`
                });
                console.log(`[WhatsAppService] 👤 User ${user.name} verified successfully for ${targetPhone} (via ${isLid ? "LID" : "PN"}).`);

            } catch (err) {
                console.error(`[WhatsAppService] ❌ Sub-catch error:`, err.message);
                if (err.message === "NUMBER_MISMATCH" || err.message === "EXPIRED") {
                    const targetPhoneForLog = await this.findPhoneByCode(code);
                    if (targetPhoneForLog) {
                        const targetUser = await User.findOne({ phoneNumber: new RegExp(targetPhoneForLog.slice(-10) + '$') });
                        if (targetUser) {
                            targetUser.lastVerificationError = err.message === "NUMBER_MISMATCH" ? "Number mismatch detected" : "Code expired";
                            await targetUser.save();
                        }
                    }

                    const errorText = err.message === "NUMBER_MISMATCH"
                        ? `❌ Security Alert: Your sender identity doesn't match the one requested.`
                        : `❌ This verification code has expired. Please request a new one.`;

                    await this.sock.sendMessage(jid, { text: errorText });
                    return;
                }
                throw err;
            }
        } catch (error) {
            console.error("[WhatsAppService] ❌ Verification error:", error);
        }
    }

    normalizeToDigits(phone) {
        let cleaned = phone.replace(/\D/g, "");
        if (cleaned.startsWith("03") && cleaned.length === 11) {
            cleaned = "92" + cleaned.slice(1);
        }
        return cleaned;
    }

    async resolveLidForPN(pnJid) {
        try {
            const query = new USyncQuery().withLIDProtocol().withContext('background');
            query.withUser(new USyncUser().withId(pnJid));

            const results = await Promise.race([
                this.sock.executeUSyncQuery(query),
                new Promise((_, reject) => setTimeout(() => reject(new Error("LID_RESOLVE_TIMEOUT")), 10000))
            ]);

            if (results?.list) {
                const match = results.list.find(a => !!a.lid);
                if (match) {
                    console.log(`[WhatsAppService] 🔗 PN→LID resolved: ${pnJid} → ${match.lid}`);
                    return match.lid;
                }
            }

            console.log(`[WhatsAppService] ⚠️ No LID found for ${pnJid}`);
            return null;
        } catch (err) {
            console.error(`[WhatsAppService] ❌ LID resolution failed for ${pnJid}:`, err.message);
            return null;
        }
    }

    async findPhoneByCode(code) {
        try {
            const { VerificationRequest } = await import("../models/verification-request.model.js");
            const request = await VerificationRequest.findOne({ code });
            return request ? request.phoneNumber : "";
        } catch (err) {
            return "";
        }
    }

    async clearSession() {
        try {
            await WhatsAppAuth.deleteMany({ sessionId: "default" });
        } catch (error) {
            console.error("Error clearing session:", error);
        }
    }

    async cleanup() {
        if (this.isShuttingDown) return;
        this.isShuttingDown = true;
        this.status = STATUS.STOPPED;
        console.log("[WhatsAppService] 🛑 Received cleanup signal. Terminating gracefully...");
        this.destroySocket();
    }
}

export const whatsappService = new WhatsAppService();
