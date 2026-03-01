## 🔍 Debug: Hardware Bitmap Crash (MIUI Persistent)

### 1. Symptom
The app crashes on startup on Android MIUI devices with the error: "Software rendering doesn't support hardware bitmaps".

### 2. Information Gathered
- **Device**: Android (MIUI)
- **Error Stack**: `onHwBitmapInSwMode` -> `MiuiCanvas.drawBitmap`.
- **Context**: Occurs during or shortly after the Splash Screen hide transition.
- **Previous Fix**: Stabilized `RootLayout` view hierarchy and added a 150ms delay. This was not enough.

### 3. Hypotheses
1. ❓ **Hypothesis 1: BlurView Conflict**: The `BlurView` used in the `home.tsx` header (integrated with search) is triggering a software-layer snapshot for its blurring logic. If `expo-image` components are loaded simultaneously in the `HeroCarousel` or `ProductCard`, the software canvas crashes.
2. ❓ **Hypothesis 2: Transition Hardware/Software Toggle**: MIUI's system-level view transition (from Native Splash to App) might be forcing a software snapshot while the app is already rendering hardware bitmaps.
3. ❓ **Hypothesis 3: LinearGradient/Shadow Fallback**: Certain styles (like specific shadows or gradients on Android) can force a `View` to use a software layer.

### 4. Investigation Plan
- **Test 1**: Temporarily disable `BlurView` in `home.tsx` and `HeroCarousel` to see if the crash persists.
- **Test 2**: Force `expo-image` to NOT use hardware bitmaps for the very first landing images (if possible) or globally for debugging.
- **Test 3**: Check for any `shadowProp` or `elevation` that might be causing software fallbacks.

### 5. Root Cause (Likely)
🎯 **MIUI's rendering engine attempts to "soft-render" the initial app view (possibly for a transition effect or blur calculation) but encounters a BITMAP that is stored exclusively in GPU memory (Hardware Bitmap), which is incompatible with the CPU-based software canvas.**

### 6. Expected Fix
Disable software-render-triggering components (like `BlurView`) on Android or wrap the high-risk areas in `renderToHardwareTextureAndroid={true}` more specifically.
