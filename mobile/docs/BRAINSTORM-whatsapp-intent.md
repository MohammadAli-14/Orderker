## 🧠 Brainstorm: Debugging "WhatsApp Not Found" on Android Physical Devices

### Context
The user successfully tested the "Magic Verify via WhatsApp" feature using the Expo Go client (development). However, when they built an Android APK (`.apk`) using EAS Preview and installed it on a physical device, tapping the button yields: **"WhatsApp Not Found. Please install WhatsApp to use this feature."**

**Root Cause Analysis:**
According to `@[mobile-debugging.md]`, bugs that appear *only* in the physical build and not in Expo Go are typically native configuration issues. 
In Android 11 (API level 30) and higher, Google introduced **Package Visibility Restrictions**. Apps can no longer query the device to see if other apps (like WhatsApp) are installed unless they explicitly declare their intent to do so in the `AndroidManifest.xml`.

Because we use `Linking.canOpenURL('whatsapp://send...')` in `PhoneVerificationModal.tsx`, the Android OS blocks the query, returns `false`, and triggers our error toast.

---

### Option A: Add Intent Queries via Expo Config Plugin in `app.json` (Recommended)
We can securely define our intent to query the `whatsapp` URI scheme directly in the `app.json` file. Expo takes care of injecting this into the `AndroidManifest.xml` during the EAS build process.

✅ **Pros:**
- Follows Expo standard practices (no need to eject to native code).
- Instantly solves the `canOpenURL` block on Android 11+.
- Fully cross-platform approach.

❌ **Cons:**
- Requires generating a new EAS build to test the native changes.

📊 **Effort:** Low

---

### Option B: Use Universal Links (`https://wa.me/`) Instead of Deep Links
Instead of using `whatsapp://send?phone=...`, we change our code to use `https://wa.me/{botNumber}?text=...`.

✅ **Pros:**
- `wa.me` is a standard HTTPS URL, so `Linking.canOpenURL()` always returns true.
- Bypasses the strict Android 11 intent query requirements completely.

❌ **Cons:**
- It opens the browser first, which then redirects to the WhatsApp app. This adds a slight delay and is less seamless ("premium") than direct deep linking.
- If WhatsApp isn't installed, the browser shows an empty WhatsApp web page rather than our clean error toast.

📊 **Effort:** Low

---

## 💡 Recommendation

**Option A** is the superior and recommended approach. It maintains the premium, native app-to-app transition speed by fixing the underlying Android intent configuration, rather than using a URL workaround. We will inject the intent queries into `app.json`.
