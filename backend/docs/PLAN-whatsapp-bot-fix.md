# Project Plan: WhatsApp Bot Message Fix

## Context & Objectives

The WhatsApp bot is online and generating OTP codes, but messages from users NEVER reach the `messages.upsert` handler. Deep code tracing through `libsignal` → `event-buffer.js` → `process-message.js` → `whatsapp.service.js` revealed that:

1. The `Closing session` logs are **normal** Signal protocol behavior (not errors)
2. The Baileys event buffer can **intercept** `messages.upsert` events during sync/prekey processing
3. The handler has **zero error handling** and **zero diagnostic logging**
4. `sendMessage()` calls have **no retry logic**

## Goal

Make the bot reliably receive and respond to `VERIFY:<code>` messages, with full diagnostic visibility.

---

## Implementation Steps

### Phase 1: Diagnostic Logging + Handler Robustness

**Agent: `backend-specialist`**

#### 1.1 Robust `messages.upsert` Handler
- **File:** `backend/src/services/whatsapp.service.js` (L275-292)
- **Changes:**
  - Wrap entire handler in `try/catch` with error logging
  - Log raw event metadata FIRST: `📨 RAW: type=${m.type}, count=${m.messages?.length}`
  - Log when messages are filtered out: `⏭️ SKIP: fromMe=${msg.key.fromMe}, type=${m.type}`
  - Guard against empty `m.messages` array (prevent `undefined` crash)

#### 1.2 Improved Text Extraction
- **File:** `backend/src/services/whatsapp.service.js` (`extractTextFromMessage`)
- **Changes:**
  - Handle `viewOnceMessageV2.message` → extract text from nested message
  - Handle `editedMessage.message` → extract text from inner message
  - Handle `documentWithCaptionMessage.message` → extract caption
  - Log the raw message keys when text is null: `⚠️ Unknown format: keys=[${Object.keys(m)}]`

#### 1.3 `sendMessage` Retry Wrapper
- **File:** `backend/src/services/whatsapp.service.js`
- **Changes:**
  - Add `async safeSendMessage(jid, content, retries = 2)` method
  - Retry with 1.5s delay on failure
  - Log each attempt and final failure
  - Replace all `this.sock.sendMessage()` calls with `this.safeSendMessage()`

---

### Phase 2: Baileys Configuration Fix

**Agent: `backend-specialist`**

#### 2.1 Prevent Event Buffer Activation
- **File:** `backend/src/services/whatsapp.service.js` (`makeWASocket` config)
- **Changes:**
  ```javascript
  // Add to makeWASocket options:
  shouldSyncHistoryMessage: () => false,
  markOnlineOnConnect: true,
  ```
- **Reason:** `shouldSyncHistoryMessage: () => false` prevents the Baileys event buffer from activating during initial connection/reconnection. This ensures real-time `messages.upsert` events with `type: "notify"` are emitted immediately, not buffered.

---

### Phase 3: Admin Diagnostic Endpoint

**Agent: `backend-specialist`**

#### 3.1 Send Test Message Endpoint
- **File:** `backend/src/controllers/whatsapp.controller.js`
- **Changes:**
  - Add `sendTestMessage(req, res)` controller
  - Accepts `{ phone, message }` body
  - Normalizes phone number (handles `03xx` format)  
  - Uses `whatsappService.sendTestMessage()` to send
  - Returns success/failure with timing info

#### 3.2 Register Route
- **File:** `backend/src/routes/whatsapp.route.js`
- **Changes:** Add `router.post("/send-test", sendTestMessage)`

#### 3.3 Service Method
- **File:** `backend/src/services/whatsapp.service.js`
- **Changes:**
  - Add `async sendTestMessage(phone, message)` method
  - Uses `safeSendMessage()` with the normalized JID
  - Returns `{ success, deliveredAt, error }`

---

## File Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `whatsapp.service.js` | MODIFY | Robust handler, retry logic, config fix, test method |
| `whatsapp.controller.js` | MODIFY | Add send-test controller |
| `whatsapp.route.js` | MODIFY | Add send-test route |

---

## Verification Checklist

### After Deployment to Render:

- [ ] **Check startup logs** — Confirm `✅ WhatsApp Bot is ONLINE!` appears
- [ ] **Send a message to the bot** from any WhatsApp — Look for new `📨 RAW:` diagnostic log
  - If seen → messages ARE arriving (handler issue fixed)
  - If NOT seen → Baileys-level issue (need further investigation)
- [ ] **Test admin endpoint** — `POST /api/whatsapp/send-test` with admin auth
  - If bot sends message → outbound works
  - If fails → socket/encryption issue
- [ ] **Full verification flow** — Phone number → Magic Verify → Send VERIFY code → Check response
- [ ] **Monitor for 30 minutes** — Confirm no 440 conflicts or session drops

### Diagnostic Decision Tree:

```
Deploy fix → Send message to bot
  │
  ├── "📨 RAW:" log appears?
  │     ├── YES → Handler receives messages ✅
  │     │     ├── "💬 Incoming Text" appears? → Text extraction works ✅
  │     │     └── "⚠️ Unknown format" appears? → Need format handler update
  │     │
  │     └── But no reply? → sendMessage failing → Check retry logs
  │
  └── NO "📨 RAW:" log at all?
        └── Baileys-level issue → May need version downgrade or session reset
```
