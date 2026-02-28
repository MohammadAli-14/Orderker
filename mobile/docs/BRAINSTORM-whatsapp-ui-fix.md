## 🧠 Brainstorm: WhatsApp UI Fix - Input Visibility

### Context
When the `PhoneVerificationModal` is opened and the keyboard pops up (due to `autoFocus`), the phone number input field is hidden under the keyboard on Android. The user only sees the title and subtitle, and the keyboard, but not the input they are typing into.

---

### Option A: Change KeyboardAvoidingView Behavior
Currently, Android uses `behavior={undefined}`. On many Android devices, especially with `edgeToEdgeEnabled: true`, explicitly setting `behavior="height"` or `behavior="padding"` can force the modal content to stay above the keyboard.

✅ **Pros:**
- Standard React Native solution.
- Easy to implement.

❌ **Cons:**
- Can be inconsistent across different Android versions/manufacturers.

📊 **Effort:** Low

---

### Option B: Adjust ScrollView Styling
The `scrollContainer` currently has `justifyContent: 'flex-end'`. When the keyboard opens and the available height shrinks, this might be forcing the content to stay at the bottom, which is now *under* the keyboard. Changing this to `justifyContent: 'center'` (when keyboard is up) or simply relying on normal scroll flow might help.

✅ **Pros:**
- Prevents content from being "pinned" to the submerged bottom.
- Better for accessibility and different screen sizes.

❌ **Cons:**
- Might change the intended "bottom sheet" look when the keyboard is closed.

📊 **Effort:** Low

---

### Option C: Use a Different Keyboard Management Strategy
Instead of `KeyboardAvoidingView` inside the Modal, we can use `avoidKeyboard` prop (if using certain libraries, but we are using standard Expo/RN) or adjust the `softwareKeyboardLayoutMode` in `app.json`. Alternatively, we can manually adjust padding/margin based on keyboard listeners.

✅ **Pros:**
- Most control over the layout.

❌ **Cons:**
- More complex code.
- Might require a native build (changing app.json).

📊 **Effort:** Medium

---

## 💡 Recommendation

**Option A + Option B**
I recommend setting `behavior="padding"` for Android in the `KeyboardAvoidingView` and removing `justifyContent: 'flex-end'` from the `scrollContainer` in favor of a simpler layout that lets the list flow naturally. We should also ensure the `Modal` is properly handling the keyboard height.

What direction would you like to explore?
