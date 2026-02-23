# PLAN: Secure WhatsApp Verification (Anti-Typo)

## Goal
Prevent users from verifying incorrect/typoed phone numbers by ensuring the WhatsApp sender ID matches the registered phone number.

## Proposed Changes

### [Backend]
#### [MODIFY] [notification.service.js](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/backend/src/services/notification.service.js)
- Update `verifyByCode` to accept a `senderNumber`.
- Only return `true` if the code matches **AND** the `senderNumber` (last 10 digits) matches the record.

#### [MODIFY] [whatsapp.service.js](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/backend/src/services/whatsapp.service.js)
- Update `handleVerification` to pass the `senderPhoneRaw` to the service.
- Handle the mismatch case by sending a helpful WhatsApp message to the user explaining that their numbers don't match.

### [Mobile]
#### [MODIFY] [PhoneVerificationModal.tsx](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/mobile/components/PhoneVerificationModal.tsx)
- Ensure the phone number input has some basic validation (e.g. length) before allowing the WhatsApp redirect.
- Improve the "Check Status" feedback if verification is still pending.

## Verification Plan
1. **Positive Case**: Use real number, send WhatsApp, verify success.
2. **Typo Case**: Type wrong number in app, send WhatsApp from real number, verify it **fails** and sends a mismatch message.
3. **Format Test**: Enter `+92300...` vs `0300...` to ensure last-10-digit matching still works.
