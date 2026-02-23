# PLAN: Fix WhatsApp LID Mismatch & Mobile UX

## Goal
Resolve the "NUMBER_MISMATCH" error caused by WhatsApp LID (Linked Identity) while ensuring a reliable mobile UX.

## Proposed Changes

### [Backend]
#### [MODIFY] [user.model.js](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/backend/src/models/user.model.js)
- Add `whatsappLid` field to `userSchema` to store the unique LID for future recognition.

#### [MODIFY] [notification.service.js](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/backend/src/services/notification.service.js)
- Update `verifyByCode` to support "Smart Matching":
    - If `senderPhoneLast10` matches the registered number -> Success.
    - If sender is an `@lid` and the code matches -> Allow verification but mark for LID registration.
    - This ensures typo protection still works (you can't verify someone else's number) but accommodates LIDs.

#### [MODIFY] [whatsapp.service.js](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/backend/src/services/whatsapp.service.js)
- Handle the LID case by saving the `whatsappLid` to the User profile on successful verification.
- Improve logging to track LID-to-JID resolutions if available.

### [Mobile]
#### [MODIFY] [PhoneVerificationModal.tsx](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/mobile/components/PhoneVerificationModal.tsx)
- Re-implement the error state and UI fixes (previous attempt was incomplete).
- Ensure "Not Verified Yet" toast doesn't persist if an error is found.
- Add a manual "Refresh Status" cooling-off period to prevent spam.

## Verification Plan
1. **LID Test**: Send verification from an account reporting an LID. Verify successful verification and LID storage in DB.
2. **Typo Protection Test**: Attempt to verify a typoed number. Verify that the app shows the mismatch and the bot blocks it.
3. **UI Sync Test**: Verify that clicking "Check Status" correctly displays either "Success", "Waiting", or the specific "Mismatch" error.
