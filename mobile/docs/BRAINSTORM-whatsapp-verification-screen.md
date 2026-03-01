## 🧠 Brainstorm: WhatsApp Verification UI Overhaul

### Context
The current `PhoneVerificationModal` feels like an "add-on" rather than a core part of the app. It floats over the UI and can feel disconnected or conflicting. The goal is to move this to a proper screen within the navigation flow to provide a more professional, integrated, and "app-native" experience.

---

### Option A: Dedicated Auth-Style Screen
Create a new screen `app/verify-phone.tsx` that uses the same design language as the login and checkout screens.

✅ **Pros:**
- Feels like a first-class feature.
- Full screen width/height allows for better typography and branding.
- Navigation is cleaner (using `router.push`).
- Keyboard handling is easier on a dedicated screen.

❌ **Cons:**
- Requires context management if we need to return to a specific state (though `router.back()` or `router.replace` usually handles this).

📊 **Effort:** Medium

---

### Option B: Sticky Bottom Sheet Screen
Use a specialized "modal" screen (using `expo-router` modal presentation) but with a more integrated design that fills more screen space.

✅ **Pros:**
- Maintains the context of the underlying screen visually.
- Fast transition.

❌ **Cons:**
- Still feels like a "popup" which is what the user wants to move away from.
- Can still have keyboard overlap issues on some devices.

📊 **Effort:** Medium

---

### Option C: Multi-Step Checkout Integration
Integrate the verification directly into the checkout flow as a required step *before* proceeding to payment.

✅ **Pros:**
- Extremely seamless.

❌ **Cons:**
- More complex to refactor if we want the same screen accessible from the Profile page.

📊 **Effort:** High

---

## 💡 Recommendation

**Option A** is the best choice. A dedicated screen at `app/verify-phone.tsx` (top-level stack) will allow us to create a premium, full-page experience. We can use the brand's purple/white color palette, add a custom header with a back button, and ensure the keyboard interaction is perfect. 

It also makes it easy to "require" this screen from multiple places (Cart, Account Info, etc.) using a simple `router.push('/verify-phone')`.

What direction would you like to explore?
