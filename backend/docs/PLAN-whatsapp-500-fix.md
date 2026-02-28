# Project Plan: WhatsApp 500 Error & Conflict Stabilisation

## Context & Objectives
The WhatsApp verification flow is currently failing with a 500 error on the backend. This is likely due to a Mongoose unique index collision on `whatsappLid` (multiple users sharing the default `""` string). Additionally, the development server is conflicting with the production server, causing a "440 Conflict" loop.

## Goal
Fix the Mongoose schema to allow multiple unverified users and provide a way to disable the bot locally to prevent session hi-jacking.

## Implementation Steps

### 1. Fix User Schema (Mongoose Conflict)
- Open `backend/src/models/user.model.js`.
- Target the `whatsappLid` field.
- **Change**: Remove `default: ""`.
- **Reason**: `unique: true` with a default value prevents more than one unverified user from existing. Removing the default and using `sparse: true` allows multiple users to have a `null/undefined` LID.

### 2. Add Bot Disable Switch (Conflict Protection)
- Open `backend/src/config/env.js`.
- Add `DISABLE_WHATSAPP_BOT: process.env.DISABLE_WHATSAPP_BOT === 'true'`.
- Open `backend/src/server.js`.
- Modify the `whatsappService.init()` call:
  ```javascript
  if (!ENV.DISABLE_WHATSAPP_BOT) {
      whatsappService.init();
  }
  ```

### 3. Cleanup Migration (Script)
- Create a temporary script `cleanup_lids.js` to convert any existing `whatsappLid: ""` to `undefined` in MongoDB to satisfy the new unique index requirements.

### 4. Verification Checklist
- [ ] Run `node cleanup_lids.js` to fix the existing database state.
- [ ] Start backend locally with `DISABLE_WHATSAPP_BOT=true` and confirm no 440 Conflict logs appear.
- [ ] Test a fresh verification flow. Confirm the 500 error no longer appears in the mobile app.
- [ ] Verify that unverified users can now coexist in the database.
