# 🔍 Debug: WhatsApp Bot Online But Not Replying to VERIFY Messages

## 1. Symptom

WhatsApp bot connects, generates OTP codes, stays online, but **never responds** when users send `VERIFY:<code>` messages. Bot was working yesterday, stopped working today.

## 2. Information Gathered

| Evidence | Source | Significance |
|----------|--------|--------------|
| `✅ WhatsApp Bot is ONLINE!` | Render logs | Bot connects successfully |
| `Generated Persistent WhatsApp Verification for 923209750042: 555648` | Render logs | OTP generation works |
| `Closing session: SessionEntry { ... }` | `libsignal/session_record.js:273` | **Normal** Signal protocol ratchet |
| `Closing open session in favor of incoming prekey bundle` | `libsignal/session_builder.js:74` | **Normal** session renegotiation |
| `✅ Stable for 5 min — 440 counter reset.` | Render logs | Connection is stable |
| **No `💬 Incoming Text` logs** | Render logs | Messages never reach the handler |
| Baileys version: `^7.0.0-rc.9` | `package.json` | **Release candidate** — may have bugs |
| `syncFullHistory: false` | `whatsapp.service.js:139` | Already disabled |

## 3. Hypotheses

1. ❓ **Event buffer swallowing messages during prekey processing** — The `event-buffer.js` in Baileys buffers `messages.upsert` events when `isBuffering === true`. The prekey bundle processing (the "Closing session" logs) happens during message decryption, which may activate the buffer. Events buffered for >30s are auto-flushed, but the handler may never see them if the buffer was activated during a sync cycle.

2. ❓ **Silent handler crash** — The `messages.upsert` handler (L275-292) has NO try/catch wrapper. If `m.messages[0]` is undefined (e.g., empty array), `msg.key.fromMe` throws and kills the handler silently. No error is logged.

3. ❓ **Messages arrive with `m.type !== "notify"`** — If Baileys delivers the message as `"append"` (history sync) instead of `"notify"` (real-time), the filter at L277 drops it silently.

4. ❓ **`sendMessage()` fails silently** — The bot receives and processes the VERIFY message, but the reply (`sendMessage`) fails because the socket encryption state is broken after the prekey renegotiation. The error is caught by the outer catch at L474 which only logs it.

5. ❓ **Baileys RC version bug** — Version `7.0.0-rc.9` is a release candidate. The `messages.upsert` event or the event buffer may have regressions compared to stable releases.

## 4. Investigation

**Testing hypothesis 1 (Event buffer):**
- Traced `event-buffer.js:106` — When `isBuffering === true`, `messages.upsert` events are stored in `data.messageUpserts` instead of emitted
- Buffer activates during history sync and prekey processing
- Auto-flush after 30s timeout OR when `bufferCount` reaches 0
- **Result:** ⚠️ POSSIBLE — If buffer activates during incoming prekey bundle, the real-time message could be delayed or lost if the buffer is flushed incorrectly

**Testing hypothesis 2 (Silent crash):**
- Inspected handler: `const msg = m.messages[0]` — if `m.messages` is empty, `msg` is `undefined`
- Then `!msg.key.fromMe` throws `TypeError: Cannot read properties of undefined (reading 'key')`
- This error would kill the handler with NO logging
- **Result:** ⚠️ POSSIBLE — but only if Baileys emits `messages.upsert` with empty messages array

**Testing hypothesis 3 (type !== "notify"):**
- The filter `m.type === "notify"` is strict
- During reconnection/sync, real-time messages CAN arrive as `"append"` type
- **Result:** ⚠️ POSSIBLE — especially during the prekey renegotiation window

**Testing hypothesis 4 (sendMessage failure):**
- If bot receives and processes but fails to reply, we would see `📥 Received verification` log but no response
- The Render logs show NO such log — so the message never reaches `handleVerification()`
- **Result:** ❌ NOT the primary issue (but still needs retry logic)

**Testing hypothesis 5 (Baileys RC bug):**
- Version `7.0.0-rc.9` is a pre-release
- Known issues with event buffering in RC versions
- **Result:** ⚠️ POSSIBLE — but can't confirm without testing a different version

## 5. Root Cause

🎯 **The messages are silently dropped BEFORE reaching the handler.** The evidence:

1. NO `💬 Incoming Text` logs → message never reaches the `messages.upsert` callback
2. The prekey renegotiation ("Closing session") indicates Signal protocol is active and processing incoming encrypted messages
3. BUT the event buffer OR a silent crash in the handler prevents the decoded message from being processed

**Most likely scenario:** The Baileys event buffer activates during the prekey processing, captures the `messages.upsert` event, and either delays it (30s timeout) or drops it during consolidation. Since the handler has no logging for "event received but filtered", we can't confirm without adding diagnostic logging.

## 6. Fix

See `PLAN-whatsapp-bot-fix.md` for the full implementation plan.

**Summary of changes:**
1. Add diagnostic logging to capture EVERY `messages.upsert` event
2. Add `shouldSyncHistoryMessage: () => false` to prevent event buffer activation
3. Add `markOnlineOnConnect: true` for reliability
4. Wrap handler in try/catch
5. Add retry logic for `sendMessage()` calls
6. Add admin `/api/whatsapp/send-test` endpoint for independent testing

## 7. Prevention

🛡️ **After fix:**
1. All `messages.upsert` events will be logged regardless of processing outcome
2. Event buffer won't capture real-time messages during sync
3. Handler crashes will be caught and logged
4. `sendMessage` failures will retry
5. Admin can test outbound messaging independently via `/api/whatsapp/send-test`
