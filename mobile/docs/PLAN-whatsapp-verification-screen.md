# Implementation Plan: WhatsApp Verification UI Overhaul

The current WhatsApp verification modal feels disconnected from the app's core UI. This plan moves the verification logic to a dedicated, high-quality screen that aligns with the app's premium aesthetic and provides a smoother user experience.

## Proposed Changes

### [Component] PhoneVerificationScreen

#### [NEW] [verify-phone.tsx](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/mobile/app/verify-phone.tsx)
- **Dedicated Layout**: Create a full-screen layout using `SafeScreen` and a custom header with a back button.
- **Port Logic**: Move state management, polling, and verification logic from `PhoneVerificationModal.tsx`.
- **Premium Design**: Use the brand's purple/white color scheme, enhanced typography, and micro-animations for the verification process.
- **Success State**: Implement the same successful verification landing page with a clear "Return to Cart/Profile" action.

### [Screen] CartScreen

#### [MODIFY] [cart.tsx](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/mobile/app/(tabs)/cart.tsx)
- **Remove Modal**: Remove the `PhoneVerificationModal` import and instance.
- **Update Trigger**: Change `setVerificationModalVisible(true)` to `router.push("/verify-phone")`.

### [Component] PhoneVerificationModal (Cleanup)

#### [DELETE] [PhoneVerificationModal.tsx](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/mobile/components/PhoneVerificationModal.tsx)
- After verifying that the new screen works perfectly, remove the old modal component to keep the codebase clean.

## Verification Plan

### Manual Verification
- **Entry Points**: Trigger verification from both the Cart screen (during checkout) and the Profile/Account Info screen.
- **Back Navigation**: Ensure that tapping the back button correctly returns the user to their previous screen without losing cart state.
- **End-to-End Verification**: Complete a full "Magic Verify" flow on the new screen.
- **Success Redirect**: Verify that after successful verification, the user is redirected back to the appropriate screen (Cart or Profile).
- **Aesthetic Audit**: Confirm the new screen looks premium and consistent with the rest of the OrderKer app.
