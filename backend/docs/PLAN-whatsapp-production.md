# Project Plan: Production-Ready WhatsApp Bot Fix

## Context

The WhatsApp bot is suffering from THREE interrelated failures:
1. **Fatal crypto crash** — corrupt Noise keys in MongoDB cause `aesDecryptGCM` to throw, killing the Node process with no recovery
2. **History flooding** — `append` type messages (old personal chats) are being processed as VERIFY candidates
3. **No real-time messages** — the bot never receives `notify` type messages because it crashes during boot or the session is degraded

## Goal

Make the WhatsApp bot production-ready: self-healing, resilient, and correctly processing ONLY real-time verification messages.

---

## Phase 1: Auto-Recovery Global Exception Handler

**File:** `backend/src/server.js`

Add a `process.on('uncaughtException')` handler that:
- Detects Baileys crypto errors (`aesDecryptGCM`, `Unsupported state or unable to authenticate data`)
- Immediately wipes the `WhatsAppAuth` MongoDB collection via direct Mongoose
- Logs `[CRITICAL] Corrupt WhatsApp session detected. Wiped. Restart will generate fresh QR.`
- Calls `process.exit(1)` so Render restarts with a clean state

This breaks the infinite crash loop by ensuring the next boot starts with a fresh session.

---

## Phase 2: Fix Message Handler — Only Process `notify`

**File:** `backend/src/services/whatsapp.service.js`

Revert the message handler to ONLY process `type=notify` messages:
- Change the condition back from `m.type !== "notify" && m.type !== "append"` to ONLY allow `m.type === "notify"`
- Keep the `append` type as a silent log-only for diagnostics: `📨 Skipping history sync (append) — ${msgCount} messages`
- This prevents the owner's personal chats from being processed as VERIFY commands

---

## Phase 3: Session Wipe Admin Endpoint

**File:** `backend/src/services/whatsapp.service.js`

Add `wipeSession()` method:
- `await WhatsAppAuth.deleteMany({ sessionId: 'default' })`
- Destroy the current socket
- Log `🧹 Session wiped. Ready for fresh QR.`
- Restart the bot via `this.init()`

**File:** `backend/src/controllers/whatsapp.controller.js`

Add `wipeSession` controller:
- Protected by admin middleware
- Calls `whatsappService.wipeSession()`
- Returns `{ success: true, message: "Session wiped. Scan new QR code." }`

**File:** `backend/src/routes/whatsapp.route.js`

Register `POST /wipe-session` route.

---

## Phase 4: Bot Number Verification Logging

**File:** `backend/src/services/whatsapp.service.js`

On successful `connection === "open"`:
- Log: `[WhatsAppService] 📱 Bot Number: ${this.getBotNumber()}`
- Log: `[WhatsAppService] 📱 ENV WHATSAPP_BOT_NUMBER: ${ENV.WHATSAPP_BOT_NUMBER}`
- This helps verify if the mobile app's deeplink points to the correct bot number.

---

## File Summary

| File | Changes |
|------|---------|
| `server.js` | Add `uncaughtException` auto-recovery for crypto crash |
| `whatsapp.service.js` | Revert to `notify`-only, add `wipeSession()`, add bot number logging |
| `whatsapp.controller.js` | Add `wipeSession` controller |
| `whatsapp.route.js` | Register `POST /wipe-session` route |

---

## Verification Checklist

After deployment:

1. **Crypto crash auto-recovery:**
   - [ ] If session is corrupt → server logs `[CRITICAL]`, wipes DB, exits
   - [ ] Render restarts → server boots cleanly with fresh init
   - [ ] QR code is generated for scanning

2. **Message handler:**
   - [ ] `append` messages are logged but NOT processed as VERIFY
   - [ ] Real-time `notify` messages ARE processed
   - [ ] VERIFY code is matched and user is verified

3. **Bot number:**
   - [ ] Startup log shows `📱 Bot Number: +923488383679`
   - [ ] This matches the ENV variable and the mobile app deeplink

4. **Admin tools:**
   - [ ] `POST /api/whatsapp/wipe-session` successfully purges session
   - [ ] `POST /api/whatsapp/send-test` can send outbound messages
