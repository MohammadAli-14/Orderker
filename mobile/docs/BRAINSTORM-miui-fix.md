## 🧠 Brainstorm: Resolving MIUI Software Rendering Conflict

### Context
MIUI devices are crashing because they see a "Hardware" image while in a "Software" render mode. This usually happens when the app uses components that trigger software fallbacks (Blur, complex shadows, some gradients).

---

### Option A: Disable Blur on Android
Replace `BlurView` with a semi-transparent `View` + `LinearGradient` on Android. iOS keeps the blur.

✅ **Pros:**
- **Rock-Solid Stability**: Removes the most likely trigger for software-canvas snapshots on Android.
- **Performance**: Faster on low-end Androids than real-time blur.

❌ **Cons:**
- Slight visual downgrade on Android (colored background instead of frosted glass).

📊 **Effort:** Low

---

### Option B: Wrap Root in Hardware Texture
Explicitly tell Android to use hardware textures for the entire navigation container or home screen.

✅ **Pros:**
- Might "force" MIUI to stay in hardware mode.

❌ **Cons:**
- Can lead to higher memory usage.
- Might not fix the "system-level" snapshot crash (MIUI handles that outside the app's direct control).

📊 **Effort:** Low

---

### Option C: Delayed Image Loading
Keep images as "hidden" or use a low-res placeholder that isn't a hardware bitmap until *after* the first 500ms of the app being visible.

✅ **Pros:**
- Avoids the crash window entirely.

❌ **Cons:**
- Poor UX (visible flash/delay of images).

📊 **Effort:** Medium

---

## 💡 Recommendation

**Option A (The Hybrid UI Strategy).**

I recommend replacing the `BlurView` in the header on Android with a standard `View` (with `backgroundColor: "rgba(255,255,255,0.95)"`). `BlurView` on Android is notoriously inconsistent and is the #1 candidate for triggering `onHwBitmapInSwMode` because it often requests a software snapshot to calculate the blur. 

By using a standard semi-transparent view on Android, we keep the app stable without sacrificing the aesthetic on iOS.

What direction would you like to explore?
