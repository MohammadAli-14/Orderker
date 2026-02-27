# Project Plan: Polish WhatsApp Verification Modal UI

## Context & Objectives
The `PhoneVerificationModal` has visual glitches on Android: the modal shifts all the way to the top of the screen when the keyboard is summoned, and error messages (Toasts) are hidden behind the native modal layer layer. We're going to fix the layout engine and transition to inline contextual errors to solve these.

## Goal
Fix `KeyboardAvoidingView` behavior for Android and refactor `showToast` validation errors to inline UI errors.

## Implementation Steps

### 1. Fix Keyboard Positioning
- Open `PhoneVerificationModal.tsx`.
- Locate the `KeyboardAvoidingView`.
- Change `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` to `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`. 
- *Fallback safety*: Android's `adjustResize` will handle the keyboard without the `height` conflict.

### 2. Implement Inline Errors for the Phone Step
- Find the `step === 'phone'` render block.
- Refactor the UI to display the `error` state variable inside the `inputGroup`.
- Example UI addition:
```tsx
{error ? (
    <View style={[styles.errorBox, { marginTop: 8, marginBottom: 0 }]}>
        <Ionicons name="alert-circle" size={18} color="#EF4444" style={{ marginRight: 6 }} />
        <Text style={styles.errorTextInline}>{error}</Text>
    </View>
) : null}
```

### 3. Replace internal `showToast` calls with `setError`
- In `handleMagicVerify`:
  - Change `showToast({ type: 'error', title: 'Invalid Number', ... })` to `setError('Please enter a valid phone number (min 10 digits).')`.
- In `handleSendOTP` (if used in future, good to cover):
  - Change similar `showToast` error calls to `setError`.
- Add an `onChangeText` hook behavior: clear the `error` state whenever the user starts typing a new number (`setError("")`).

### 4. Verification Checklist
- [ ] Tapping the input on Android smoothly pushes the modal up to rest exactly atop the keyboard without covering the whole screen.
- [ ] Submitting an invalid number (like "123") shows a crisp red inline error inside the modal box.
- [ ] No toasts appear *behind* the modal dialog while it is open.
