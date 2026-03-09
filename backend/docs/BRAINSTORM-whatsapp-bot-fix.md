# 🧠 Brainstorm: WhatsApp OTP Bot Not Responding

## Context

The WhatsApp OTP verification bot for OrderKer is **online and generating codes**, but **does NOT reply** when users send `VERIFY:<code>` messages. The bot was working yesterday. Render logs show:
- ✅ Bot connects successfully
- ✅ OTP codes generated and stored in MongoDB  
- ✅ Bot stays stable for 5+ minutes
- ❌ No `💬 Incoming Text` logs when users send messages
- ⚠️ `Closing session` and `Closing open session in favor of incoming prekey bundle` logs appear

**Root Cause Analysis** (from deep code tracing):
- `Closing session` comes from `libsignal/session_record.js:273` — **normal** Signal protocol behavior
- `Closing open session in favor of incoming prekey bundle` comes from `libsignal/session_builder.js:74` — **normal** session renegotiation
- Baileys `event-buffer.js` can **buffer `messages.upsert` events for up to 30 seconds** during history sync
- The `messages.upsert` handler on L275-292 has **zero error handling** around the entire handler
- Messages with `m.type !== "notify"` are **silently dropped** with no logging

---

### Option A: Diagnostic Logging + Robust Handler (Quick Fix)

Add comprehensive logging to the `messages.upsert` handler to capture ALL events regardless of type, wrap the entire handler in try/catch, and add detailed extraction failure logging.

**What changes:**
1. Log raw event data (count, type) for EVERY `messages.upsert` event
2. Log when messages are filtered out (e.g., `fromMe === true`, `type !== "notify"`)
3. Wrap entire handler in try/catch to prevent silent crashes
4. Add fallback text extraction for newer WhatsApp message formats (`viewOnceMessageV2`, `editedMessage`)
5. Add retry logic (2 attempts) for `sendMessage()` calls

✅ **Pros:**
- Immediately reveals exactly WHERE messages are lost
- Can be deployed in minutes
- Zero risk — only adds logging + safety

❌ **Cons:**
- May not fix the root cause if it's a Baileys-level buffering issue
- More log noise on Render

📊 **Effort:** Low

---

### Option B: Disable History Sync + Event Buffer Bypass

The Baileys event buffer can hold `messages.upsert` events for up to 30 seconds during history sync. By disabling `syncFullHistory` (already done) AND setting `shouldSyncHistoryMessage` to always return `false`, we prevent the event buffer from activating during incoming prekey bundle processing.

**What changes:**
1. Add `shouldSyncHistoryMessage: () => false` to `makeWASocket` config
2. Add `fireInitQueries: false` to reduce initial connection overhead
3. This prevents the event buffer from intercepting real-time `notify` events

✅ **Pros:**
- Directly addresses the buffering hypothesis
- Simple config change
- Reduces reconnection overhead

❌ **Cons:**
- May not be the actual cause
- Without Option A, we still can't diagnose what's happening

📊 **Effort:** Low

---

### Option C: Full Reliability Overhaul (Send Test + Message ACK + Health Monitor)

Complete reliability overhaul of the WhatsApp service:
1. Add admin `/api/whatsapp/send-test` endpoint to test outbound messages independently
2. Add `message-receipt.update` listener to confirm message delivery
3. Add periodic health check that sends a test message every 10 minutes
4. Add `markOnlineOnConnect: true` to ensure the bot appears active
5. Track message processing metrics (received count, processed count, error count)

✅ **Pros:**
- Complete observability and reliability
- Can self-diagnose future issues
- Prevents recurrence

❌ **Cons:**
- More complex implementation
- Health check messages may annoy test recipients

📊 **Effort:** Medium

---

## 💡 Recommendation

**Option A + Option B** — Deploy both together. Option A gives us immediate visibility into exactly what's happening, and Option B addresses the most likely technical cause (event buffering during prekey bundle processing). Option C can be added later for long-term reliability.

The key insight is: **without diagnostic logging, we're debugging blind**. Option A must go first.
