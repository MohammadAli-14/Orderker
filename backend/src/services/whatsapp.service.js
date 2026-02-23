import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from "@whiskeysockets/baileys";
import { USyncQuery } from "@whiskeysockets/baileys/lib/WAUSync/USyncQuery.js";
import { USyncUser } from "@whiskeysockets/baileys/lib/WAUSync/USyncUser.js";
import { Boom } from "@hapi/boom";
import qrcodeTerminal from "qrcode-terminal";
import QRCode from "qrcode";
import pino from "pino";
import { WhatsAppSession } from "../models/whatsapp-session.model.js";
import { User } from "../models/user.model.js";
import fs from "fs";
import path from "path";
import { notificationService } from "./notification.service.js";

class WhatsAppService {
    constructor() {
        this.sock = null;
        this.sessionDir = process.env.WHATSAPP_SESSION_DIR || "./whatsapp_auth";
        this.logger = pino({ level: "silent" });
    }

    async init() {
        console.log("[WhatsAppService] 🚀 Initializing WhatsApp Bot...");

        // Ensure session directory exists for Baileys to use as initial cache
        if (!fs.existsSync(this.sessionDir)) {
            fs.mkdirSync(this.sessionDir, { recursive: true });
        }

        // 1. Try to restore session from MongoDB if the directory is empty (e.g. on Render restart)
        await this.syncFromDB();

        const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();

        this.sock = makeWASocket({
            version,
            auth: state,
            logger: this.logger,
            browser: ["OrderKer Bot", "Chrome", "4.0.0"],
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
            await this.syncToDB(); // Backup to MongoDB whenever credentials update
        });

        this.sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log("[WhatsAppService] 📲 QR Code updated!");

                // 1. Print in terminal (fallback)
                qrcodeTerminal.generate(qr, { small: true });

                // 2. Save as PNG (Reliable)
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
                const statusCode = (lastDisconnect.error instanceof Boom)
                    ? lastDisconnect.error.output.statusCode
                    : 0;

                console.log(`[WhatsAppService] 🔌 Connection closed (Status: ${statusCode})`);

                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                if (shouldReconnect) {
                    console.log("[WhatsAppService] 🔄 Attempting to reconnect in 5 seconds...");
                    setTimeout(() => this.init(), 5000); // Add a small delay to prevent tight loops
                } else {
                    console.log("[WhatsAppService] ❌ Logged out. Clearing session and restarting...");
                    this.clearSession();
                    setTimeout(() => this.init(), 5000);
                }
            } else if (connection === "open") {
                console.log("[WhatsAppService] ✅ WhatsApp Bot is ONLINE!");
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
                // We ask WhatsApp: "Who officially owns targetPhone?"

                // 1. Normalize to strictly DIGITS ONLY for Baileys onWhatsApp (E.164 without domain)
                const normalizedDigits = this.normalizeToDigits(targetPhone);
                console.log(`[WhatsAppService] 🔍 Resolving Identity (Digits): ${targetPhone} -> ${normalizedDigits}...`);

                // 2. Resolve via WhatsApp (pass string directly — Baileys uses ...rest params)
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
                    // LID senders: Resolve typed number's PN → LID, then compare with sender's LID
                    console.log(`[WhatsAppService] 🔐 LID sender detected. Resolving LID for ${resolvedJid}...`);
                    const typedNumberLid = await this.resolveLidForPN(resolvedJid);

                    if (!typedNumberLid) {
                        console.log(`[WhatsAppService] ⚠️ Could not resolve LID for ${resolvedJid}. Rejecting (fail-safe).`);
                        user.lastVerificationError = "Could not verify ownership. Please try again.";
                        await user.save();
                        await this.sock.sendMessage(jid, { text: `❌ Could not verify ownership of ${targetPhone}. Please try again in a moment.` });
                        return;
                    }

                    const senderLidRaw = fromRaw; // e.g. "59601579982958"
                    const typedLidRaw = typedNumberLid.split("@")[0]; // strip @lid domain
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
                    // PN senders: Direct JID comparison
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

                // 1. LID Identity Lock
                if (user.whatsappLid && user.whatsappLid !== fromRaw) {
                    user.lastVerificationError = "Account already locked to another WhatsApp";
                    await user.save();
                    console.log(`[WhatsAppService] 🛡️ LID LOCK: User ${user.name} tried to switch LID from ${user.whatsappLid} to ${fromRaw}`);
                    await this.sock.sendMessage(jid, { text: `❌ Your account is already linked to a different WhatsApp. Use your original account.` });
                    return;
                }

                // 2. Cross-User Conflict
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

    // Helper to normalize local numbers to International E.164 Digits (no domain)
    // e.g. 03015072008 -> 923015072008
    normalizeToDigits(phone) {
        let cleaned = phone.replace(/\D/g, "");

        // Pakistani normalization: 03... -> 923...
        if (cleaned.startsWith("03") && cleaned.length === 11) {
            cleaned = "92" + cleaned.slice(1);
        }

        return cleaned;
    }

    // Resolves a PN JID (e.g. "923015072008@s.whatsapp.net") to its LID (e.g. "59601579982958@lid")
    // Uses Baileys' executeUSyncQuery with LID protocol
    async resolveLidForPN(pnJid) {
        try {
            const query = new USyncQuery().withLIDProtocol().withContext('background');
            query.withUser(new USyncUser().withId(pnJid));

            // executeUSyncQuery already parses the result internally (calls parseUSyncQueryResult)
            // So we get back { list: [...] } directly — NOT a raw binary node
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

    // Updated to search DB instead of memory
    async findPhoneByCode(code) {
        try {
            const { VerificationRequest } = await import("../models/verification-request.model.js");
            const request = await VerificationRequest.findOne({ code });
            return request ? request.phoneNumber : "";
        } catch (err) {
            return "";
        }
    }

    async syncToDB() {
        try {
            const credsRaw = fs.readFileSync(path.join(this.sessionDir, "creds.json"), "utf8");
            await WhatsAppSession.findOneAndUpdate(
                { sessionId: "default" },
                { data: credsRaw },
                { upsert: true }
            );
        } catch (error) {
            // File might not exist yet
        }
    }

    async syncFromDB() {
        try {
            const session = await WhatsAppSession.findOne({ sessionId: "default" });
            if (session && session.data) {
                fs.writeFileSync(path.join(this.sessionDir, "creds.json"), session.data);
                console.log("[WhatsAppService] 💾 Restored session from MongoDB.");
            }
        } catch (error) {
            console.log("[WhatsAppService] ℹ️ No session found in MongoDB.");
        }
    }

    async clearSession() {
        try {
            await WhatsAppSession.deleteOne({ sessionId: "default" });
            if (fs.existsSync(this.sessionDir)) {
                fs.rmSync(this.sessionDir, { recursive: true, force: true });
            }
        } catch (error) {
            console.error("Error clearing session:", error);
        }
    }
}

export const whatsappService = new WhatsAppService();
