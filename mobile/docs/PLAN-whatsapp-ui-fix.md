# Implementation Plan: WhatsApp UI Fix - Input Visibility

The phone number input field in the WhatsApp verification modal is currently being obscured by the keyboard on Android devices. This plan addresses the layout issues to ensure the input field remains visible and focused when the keyboard is active.

## Proposed Changes

### [Component] PhoneVerificationModal

#### [MODIFY] [PhoneVerificationModal.tsx](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/mobile/components/PhoneVerificationModal.tsx)
- **Change Keyboard Avoiding Behavior**: Update `KeyboardAvoidingView` to use `behavior="height"` on Android (or `padding` depending on further tests, but `height` is often better for bottom sheets in Modals).
- **Update Scroll Container Style**: Remove `justifyContent: 'flex-end'` from `scrollContainer`. This property forces content to the bottom of the available space, which can be submerged behind the keyboard if the view doesn't resize perfectly. Rely on the `overlay`'s `justifyContent: 'flex-end'` to maintain the bottom sheet look.
- **Add Keyboard Vertical Offset**: Add a small `keyboardVerticalOffset` to ensure there's balanced spacing between the keyboard and the input field.

## Verification Plan

### Manual Verification
- Open the shopping cart and trigger the phone verification modal.
- Verify that the modal appears as a bottom sheet.
- Tap the phone number input field.
- **Success Criteria**: The modal should shift upwards, keeping the "Verify Your Phone" title AND the "Phone Number" input box clearly visible above the keyboard.
- Verify that the "Magic Verify" button is also accessible or reachable by scrolling.
