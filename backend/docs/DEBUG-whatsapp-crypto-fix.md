# 🔍 Debug: WhatsApp Crypto Decryption Crash (Node exit 1)

## 1. Symptom

The Render server process crashes completely with exit code `1` and the following stack trace:
```
Error: Unsupported state or unable to authenticate data
    at Decipheriv.final (node:internal/crypto/cipher:170:29)
    at aesDecryptGCM (file:///opt/render/project/src/backend/node_modules/@whiskeysockets/baileys/lib/Utils/crypto.js)
```
Additionally, after restarting, the diagnostic logs show `💬 Incoming Text: "Okay paid wala he Karyn gay..."`, meaning the message handler **is now working and decrypting texts successfully** when connected.

## 2. Information Gathered

- **Error**: `aesDecryptGCM` fails to authenticate data during the WebSocket `receiverOnMessage` event.
- **Location**: Deep inside `@whiskeysockets/baileys` noise-handler.js.
- **Context**: Happens immediately after `[MongoDBAuthState] Read creds noiseKey.private`.
- **Significance**: This is a fatal `uncaughtException` that bypasses standard try/catch blocks because it occurs asynchronously inside the `ws` (Websocket) library's event loop.

## 3. Hypotheses

1. ❓ **Corrupt Auth State in MongoDB**: The Signal/Noise protocol keys stored in the `WhatsAppAuth` DB collection have become desynchronized from WhatsApp's servers (likely due to previous rapid reconnects, 440 conflicts, or switching between local and Render). When Baileys tries to use these keys to decrypt incoming WebSocket frames, `aesDecryptGCM` throws a cryptographic integrity error.
2. ❓ **Baileys Bug**: Version `7.0.0-rc.9` fails to handle socket-level decryption errors gracefully, letting them crash the Node process instead of emitting a `connection.update` error.

## 4. Investigation

- **Testing Hypothesis 1 (Corrupt State)**: The stack trace shows the error happens during the Noise protocol handshake (`noise-handler.js`), right after loading `noiseKey`. This is a classic symptom of invalidated/corrupted session keys in Baileys. The only fix is to delete the `creds.json` equivalent (in our case, the MongoDB `WhatsAppAuth` documents).
- **Testing Hypothesis 2 (Fatal Crash)**: Reviewed Baileys architecture. Decryption happens directly in the `ws` message event callback. If it throws, it bubbles up to Node's `unhandledRejection` / `uncaughtException`, causing the `Instance failed: lrnkr` exit status 1 on Render.

## 5. Root Cause

🎯 **Corrupt Authentication Session + Fatal Unhandled Exception.**
The WhatsApp session data established previously is now invalid/corrupted. When the bot connects, it attempts to negotiate encryption using invalid keys, which throws a fatal Node.js crypto error that crashes the entire backend server.

*(Note: The `VERIFY:` message issue was actually fixed by Phase 1! Your logs show the bot is now successfully intercepting and decoding real user messages. But the bot keeps crashing due to this corrupted session data).*

## 6. Fix

See the full plan in `PLAN-whatsapp-crypto-fix.md`.
We must:
1. Provide a way to completely **wipe the corrupted session** from MongoDB so it can generate a fresh QR code.
2. Add a global **fallback crash handler** that intercepts this specific crypto error, wipes the database automatically, and allows Render to restart the app cleanly.

## 7. Prevention

🛡️ The auto-recovery system will detect future `aesDecryptGCM` crashes and self-heal by purging the corrupt database session before the process dies.
