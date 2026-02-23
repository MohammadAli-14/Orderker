# PLAN: Environment Stabilization

## Context
Fixed a "Fatal process out of memory" error in Metro and verified WhatsApp bot stability.

## Task Breakdown
1. [ ] Set `NODE_OPTIONS="--max-old-space-size=4096"` in terminal.
2. [ ] Run `npx expo start --clear`.
3. [ ] Test WhatsApp "Magic Verify" flow.
4. [ ] Confirm MongoDB session persistence.

## Verification Checklist
- [ ] Metro bundler completes without crash.
- [ ] WhatsApp message `VERIFY:CODE` triggers `isPhoneVerified: true` in user record.
