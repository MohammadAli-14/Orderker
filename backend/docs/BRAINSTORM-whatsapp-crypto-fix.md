# 🧠 Brainstorm: Resolving Baileys Crypto Crash (`aesDecryptGCM`)

## Context

The backend instance on Render is crashing with `Error: Unsupported state or unable to authenticate data` during WhatsApp WebSocket decryption. This is a fatal Node.js error caused by out-of-sync or corrupted Noise protocol keys in the `WhatsAppAuth` MongoDB collection. The bot needs a fresh session (new QR code), but the crash happens before we can clear it gracefully.

---

### Option A: Manual DB Wipe via Admin Endpoint

Create a new `/api/whatsapp/wipe-session` endpoint. When called, it explicitly drops the `WhatsAppAuth` collection using Mongoose, bypassing the Baileys library entirely, and cleanly restarts the `whatsappService`.

✅ **Pros:**
- Direct, guaranteed way to clear corrupt state.
- Can be triggered manually whenever the bot gets "stuck".

❌ **Cons:**
- Requires the server to actually boot up successfully long enough to receive the API request. (If it crashes instantly on boot, the endpoint is useless).

📊 **Effort:** Low

---

### Option B: Auto-Recovery via Global Exception Handler

Inject a `process.on('uncaughtException')` handler in the server entry point. If the error includes `aesDecryptGCM` or `noise-handler`, the server immediately executes a database wipe on the `WhatsAppAuth` collection and performs a `process.exit(1)`. Render will then auto-restart the container, which will boot up with a clean state and generate a new QR code.

✅ **Pros:**
- Complete self-healing. Zero manual intervention required.
- Catches the exact crash vector shown in the Render logs.

❌ **Cons:**
- Global exception handlers can be dangerous if they hide other bugs. (Must strictly filter for this specific Baileys crypto error).

📊 **Effort:** Medium

---

### Option C: Try/Catch Monkeypatch in Baileys Socket

Use a package manager patch (e.g., `patch-package`) to modify `@whiskeysockets/baileys/lib/Utils/noise-handler.js` to wrap the `decodeFrame` execution in a try/catch, emitting a disconnect event instead of throwing an unhandled exception.

✅ **Pros:**
- Solves the problem at the exact root source in the library.

❌ **Cons:**
- Very brittle. Breaks on Baileys version updates.
- Hard to maintain.

📊 **Effort:** High

---

## 💡 Recommendation

**Option A + Option B combined.**

Provide the admin `/wipe-session` endpoint for manual control, AND implement the `uncaughtException` auto-recovery heuristic. The auto-recovery ensures that the Render instance can "heal" itself from a crypto loop without requiring you to manually log into MongoDB Atlas to delete the documents.

When the crash happens:
1. The global catcher detects `Unsupported state or unable to authenticate data`.
2. It runs `WhatsAppAuth.deleteMany({})`.
3. It lets the process exit.
4. Render restarts it.
5. Bot boots up -> clean state -> fresh QR code.
