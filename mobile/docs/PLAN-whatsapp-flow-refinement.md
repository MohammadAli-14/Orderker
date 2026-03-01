# Implementation Plan: WhatsApp Flow Refinement & Styling

This plan addresses UI feedback and a critical flow bug where verification errors (like "belongs to another user") are not immediately visible after returning from WhatsApp.

## Proposed Changes

### [Screen] VerifyPhoneScreen

#### [MODIFY] [verify-phone.tsx](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/mobile/app/verify-phone.tsx)
- **UI Refinement**: Update success button text to "Continue to Place Order".
- **Styling**: Enhance `primaryButton` shadows and shading to ensure it looks "properly purple" and premium.
- **Logic Fix (Proactive Error Handling)**:
    - Update `checkStatus` to detect hard errors (like "belongs to another user").
    - If a hard error is found during polling, automatically set step back to `'phone'` so the user can immediately see the error and change the number.
- **UI Component Update**: Ensure the `Waiting` section can also display the error if we decide not to auto-switch. (Choosing Option B from brainstorm: Auto-switch).

### [Backend] WhatsApp Context

#### [VERIFY] [user.controller.js](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/backend/src/controllers/user.controller.js)
- Ensure the backend properly sets `lastVerificationError` when a LID conflict is detected. (This was implemented in previous tasks but I will double-check).

## Verification Plan

### Manual Verification
- **Success Text**: Verify the button says "Continue to Place Order" on the success screen.
- **Button Style**: Check the shadow/shading on Android and iOS.
- **Conflict Flow**: 
    1. Enter a number known to be linked to another account.
    2. Click Magic Verify -> Opens WhatsApp.
    3. Return to app.
    4. Wait for polling (or click Check Manually).
    5. **Expectation**: App should automatically show the red error "WhatsApp belongs to another user" or switch back to the input screen with that error visible.
