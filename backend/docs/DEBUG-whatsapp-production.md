# 🔍 Debug: WhatsApp Bot — Complete Production Failure Analysis

## 1. Symptom

The WhatsApp bot has THREE distinct problems causing a cascading failure:

| Problem | Evidence | Severity |
|---------|----------|----------|
| **Fatal crypto crash** | `Error: Unsupported state or unable to authenticate data` at `aesDecryptGCM` | 🔴 CRITICAL — kills the entire Node process |
| **History flooding** | ALL messages logged are `type=append`, processing personal chats | 🟡 MEDIUM — wastes resources, processes irrelevant messages |
| **No real-time messages** | ZERO `type=notify` messages in logs | 🔴 CRITICAL — VERIFY messages never reach the handler |

## 2. Information Gathered

### Render Logs Evidence:

```
📨 RAW EVENT: type=append, count=22        ← History sync, NOT real-time
💬 Incoming Text: "Okay paid wala he..."   ← Owner's PERSONAL chat, NOT a VERIFY message
💬 Incoming Text: "Backend ka Kya scene hi" ← Group chat message, NOT a VERIFY message
```

**Key observation from user:** These messages are NOT verification attempts. They are the bot owner's personal WhatsApp conversations being synced on connection. The bot has NEVER received a single real `VERIFY:` message.

### File Tracing:

| File | Finding |
|------|---------|
| `verify-phone.tsx:88-92` | Mobile constructs `whatsapp://send?phone=${botNumber}&text=VERIFY:${code}` deeplink |
| `config.controller.js:67` | Returns `whatsappService.getBotNumber() || ENV.WHATSAPP_BOT_NUMBER` |
| `env.js:22` | Default: `+923488383679` |
| `whatsapp.service.js:82-86` | `getBotNumber()` extracts from `sock.user.id` |
| `server.js` | No `uncaughtException` handler — crypto crash kills server |
| `useMongoDBAuthState.js` | Session persisted in `WhatsAppAuth` MongoDB collection |

## 3. Hypotheses

1. ❓ **Corrupt Noise keys crash the server BEFORE real-time messages can arrive** — The `aesDecryptGCM` error kills the process during boot. Even when it doesn't crash, the session may be degraded such that encrypted incoming real-time frames can't be decrypted.

2. ❓ **`append` history sync floods the handler** — On reconnection, Baileys loads old chat messages first. These arrive as `type=append`. The current handler (after our fix) now processes `append` too — this is WRONG. Only `type=notify` should be processed for VERIFY commands. We accidentally introduced this in the previous fix.

3. ❓ **Bot number mismatch** — If `getBotNumber()` returns a different number than what the mobile app uses in the deeplink, the user would be sending the VERIFY message to the wrong WhatsApp account.

## 4. Investigation

**Testing H1 (Crypto crash):**
- The crash at `aesDecryptGCM` in `noise-handler.js` is an unhandled exception in the WebSocket layer.
- There is NO `process.on('uncaughtException')` in `server.js` — this means the process dies with NO cleanup, NO session wipe, and NO recovery.
- On Render, the process auto-restarts, but it loads the SAME corrupt session from MongoDB, causing an infinite crash loop.
- **Result:** ✅ CONFIRMED root cause of `Instance failed: lrnkr`.

**Testing H2 (History flooding):**
- Looking at the logs: `📨 RAW EVENT: type=append, count=22` — ALL 22 messages are history sync.
- My previous fix changed the handler from `m.type === "notify"` to `m.type !== "notify" && m.type !== "append"`, which means `append` messages are NOW processed as VERIFY candidates. This is WRONG — `append` messages are old history and should NEVER trigger VERIFY logic.
- **Result:** ✅ CONFIRMED — must revert to ONLY process `type=notify`.

**Testing H3 (Bot number mismatch):**
- The mobile fallback is `+923488383679`.
- `getBotNumber()` extracts from `sock.user.id`, which depends on the session. If the session is from a different scan, the number could be different.
- Without access to the actual running instance, can't verify this directly.
- **Result:** ⚠️ POSSIBLE — needs a log to confirm the actual bot number at runtime.

## 5. Root Cause

🎯 **Three interrelated failures:**

1. **Corrupt session → crash loop**: The MongoDB-persisted Noise keys are out of sync with WhatsApp's server. Every restart loads the same corrupt keys, causing the same crash. No auto-recovery exists.

2. **`append` messages processed as commands**: The previous fix accidentally started processing history sync messages (`type=append`) alongside real-time messages. This floods the handler with personal conversations that are NOT verification requests.

3. **Real-time messages never arrive**: Because the server keeps crashing during boot (crypto error), or the session is degraded, real-time `notify` messages from users sending `VERIFY:code` never reach the handler.

## 6. Fix → See `PLAN-whatsapp-production.md`

## 7. Prevention

🛡️ After this fix:
- Auto-recovery wipes corrupt sessions automatically on crypto crash
- Only `type=notify` messages trigger VERIFY logic
- Bot number is logged on startup for verification
- Admin can manually wipe session if needed
- `append` messages are silently skipped
