# Project Plan: WhatsApp Crypto Crash Fix (Node exit 1)

## Context & Objectives

The Render instance is crashing fatally with `Error: Unsupported state or unable to authenticate data` deep inside the Baileys WebSocket connection (`aesDecryptGCM`). This completely kills the Node process (exit code 1). The root cause is that the authenticated session keys stored in MongoDB (`WhatsAppAuth`) are corrupted or severely out of sync with WhatsApp's servers.

However, the provided logs confirm that the **previous fix for `VERIFY` messages was successful!** The bot successfully logged:
`💬 Incoming Text: "Okay paid wala he Karyn gay..."`
This proves the bot is interpreting messages correctly now. The only remaining hurdle is this fatal cryptocurrency/noise handshake loop preventing the bot from staying online.

## Goal

Provide self-healing auto-recovery from corrupted Baileys sessions, and add a manual fail-safe admin endpoint to purge the session state if needed.

---

## Implementation Steps

### Phase 1: Global Auto-Recovery Exception Handler

**Agent: `backend-specialist`**

#### 1.1 Uncaught Exception Catcher
- **File:** `backend/src/server.js`
- **Changes:**
  - Add `process.on('uncaughtException', ...)` at the top level.
  - Check if the error message contains `Unsupported state or unable to authenticate data` or stack contains `aesDecryptGCM`.
  - If a match is found:
    - Log `[CRITICAL] Detected corrupted WhatsApp session. Wiping database...`
    - Call `mongoose.connection.collection('whatsappauths').deleteMany({})` directly.
    - Gracefully exit the process (`process.exit(1)`) so Render can restart it with a clean slate to generate a new QR code.
  - If NOT a match, log the normal error and exit.

#### 1.2 Graceful Shutdown Enhancement
- **File:** `backend/src/services/whatsapp.service.js`
- **Changes:**
  - Expose a `wipeSession()` utility method in `WhatsAppService` that truncates the `WhatsAppAuth` model safely using `WhatsAppAuth.deleteMany({})`.

---

### Phase 2: Admin Session Wipe Endpoint

**Agent: `backend-specialist`**

#### 2.1 Wipe Session Controller
- **File:** `backend/src/controllers/whatsapp.controller.js`
- **Changes:**
  - Add `wipeSession(req, res)` controller.
  - Accepts `POST`.
  - Calls `await whatsappService.wipeSession()`.
  - Sends response: `Session wiped successfully. Restarting bot...`
  - Restarts the bot by calling `whatsappService.init()` after wiping.

#### 2.2 Register Wipe Route
- **File:** `backend/src/routes/whatsapp.route.js`
- **Changes:** Add `router.post("/wipe-session", wipeSession)`.

---

## File Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `server.js` | MODIFY | Add `uncaughtException` auto-recovery heuristic. |
| `whatsapp.service.js` | MODIFY | Expose `wipeSession()` method. |
| `whatsapp.controller.js` | MODIFY | Add `/wipe-session` controller logic. |
| `whatsapp.route.js` | MODIFY | Register `/wipe-session` route. |

---

## Verification

### After Deployment to Render:

- [ ] Wait for Render to finish the build.
- [ ] Watch the logs. If the crypto state is still corrupt, the `uncaughtException` handler will catch it, print the `[CRITICAL]` warning, wipe the DB, and restart.
- [ ] Upon successful restart, the bot will log `[WhatsAppService] 🚀 Initializing WhatsApp Bot...` and output a brand new QR Code base64 URL.
- [ ] Scan the new QR code.
- [ ] Send `VERIFY:<code>` and watch the handler process it correctly!
