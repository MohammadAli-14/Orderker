## 🧠 Brainstorm: WhatsApp Verification Modal UI Issues

### Context
The user reported two major UX issues with the `PhoneVerificationModal` on Android:
1. **Keyboard Glitch**: When typing a phone number, the modal flies to the absolute top of the screen (full screen) instead of gently rising above the keyboard.
2. **Hidden Toasts**: When typing an invalid number, the error popup (Toast) appears *behind* the modal, making it invisible to the user.

---

### Analysis: Keyboard Glitch

**Why it happens:**
In React Native, `<Modal>` creates a new native window. Inside that window, we used `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>`. On Android, `behavior="height"` aggressively shrinks the flex container. When combined with a `ScrollView` and `justifyContent: 'flex-end'`, it often forces the content all the way to the top margin under the status bar.

**Options:**
1. **Option 1**: Change behavior to `undefined` for Android. Expo apps built for Android default to `windowSoftInputMode="adjustResize"`, meaning Android automatically shrinks the modal bounds when the keyboard opens. Using `KeyboardAvoidingView` on top of that causes conflict.
2. **Option 2**: Leave `padding` for iOS but use an empty string or null for Android.

### Analysis: Hidden Toasts

**Why it happens:**
The custom `useToast` provider lives at the root React level. Native `<Modal>` components render entirely on top of the root view node, effectively giving them a massive native z-index. The Toast triggers successfully, but renders *underneath* the modal's semi-transparent grey backdrop.

**Options:**
1. **Option 1**: Convert the Native `<Modal>` into an absolutely positioned view that shares the same React tree as the Toast Provider. 
   - *Cons*: Total rewrite of the modal animation logic.
2. **Option 2**: Use **Inline Errors** instead of Toasts. The component already has an `errorBox` UI for the OTP polling step. We can reuse this inline error state directly on the Phone Number input step.
   - *Pros*: Follows UI/UX best practices (errors should be contextual to the input). Easy to implement.

---

## 💡 Recommendations

1. **For the Keyboard**: Modify `KeyboardAvoidingView` to use `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`. The padding is critical for iOS iPhones, but Android will handle resizing natively.
2. **For the Errors**: We will stop using `showToast` for validation errors inside the modal. Instead, we will add an inline `{error ? <Text style={styles.errorTextInline}>{error}</Text> : null}` below the phone input, and use `setError(errorMessage)` in our submit functions.
