## 🧠 Brainstorm: Handling Hardware Bitmap Crash

### Context
The app crashes on Android when the splash screen hides, because the incoming view (likely `WelcomeScreen` or `HomeScreen`) contains images that cannot be drawn to the OS's internal "snapshot" canvas.

---

### Option A: The "Stable Hierarchy" approach
Modify `StartupLogic` to never return `null`. Instead, return a blank `View` that matches the splash screen color. This ensures the React Native rendering context is fully initialized before the splash screen hides.

✅ **Pros:**
- Keeps the view tree stable.
- Likely to fix the MIUI rendering conflict.

❌ **Cons:**
- Adds a very minor extra layer/view.

📊 **Effort:** Low

---

### Option B: The "Graceful Image Rendering" approach
Global configuration for `expo-image` or specific images to avoid hardware bitmaps if they are on the initial screen. Alternatively, wrap the initial screens in a `View` with `renderToHardwareTextureAndroid={true}`.

✅ **Pros:**
- Addresses the root cause of "hardware bitmap" incompatibility.

❌ **Cons:**
- Might slightly reduce image rendering performance for those specific images.

📊 **Effort:** Medium

---

### Option C: The "Delayed Visibility" approach
Keep the splash screen hidden, but keep the `children` invisible (`opacity: 0`) for the first 100ms after mount, then fade them in.

✅ **Pros:**
- Avoids the crash by ensuring the first few frames (where snapshots happen) have no complex content.

❌ **Cons:**
- Adds complexity to the UI logic.

📊 **Effort:** Medium

---

## 💡 Recommendation

**Option A** is the most robust and standard way to fix this. React Native's root should ideally have a stable background while the splash screen is up to avoid the OS thinking the view is "empty" and falling back to software paths.

What direction would you like to explore?
