## 🔍 Debug: Software rendering doesn't support hardware bitmaps

### 1. Symptom
The app crashes on startup on Android devices (MIUI/Xiaomi specifically) with a red error screen: "Software rendering doesn't support hardware bitmaps".

### 2. Information Gathered
- **Error**: `onHwBitmapInSwMode` (BaseCanvas.java:699)
- **File**: `app/_layout.tsx` (Recent changes in `StartupLogic`)
- **Device**: Android (MIUI context shown in stack trace)
- **Context**: Occurs after implementing synchronized splash screen hiding.

### 3. Hypotheses
1. ❓ **Hypothesis 1: Transition Snapshot Conflict**: MIUI/Android might be trying to take a "software snapshot" of the screen during the transition from Native Splash Screen to the React Native View. If the React Native view contains `expo-image` components (hardware-backed), the snapshotter crashes.
2. ❓ **Hypothesis 2: StartupLogic Null Return**: Returning `null` until fonts are loaded might be leaving the `View` hierarchy in an unstable state that MIUI's UI thread handles incorrectly when the splash screen finally hides.
3. ❓ **Hypothesis 3: expo-image Hardware Preference**: The `expo-image` components in `WelcomeScreen` (index.tsx) or `home.tsx` might be defaulting to hardware bitmaps in a way that conflicts with low-power or specific Android rendering paths during initial mounting.

### 4. Investigation

**Testing hypothesis 1 & 2:**
The `StartupLogic` returns `null` initially. This is generally safe, but combined with the `SplashScreen.hideAsync()` call happening right after the mount, it might be too fast for the hardware-acceleration to kick in fully on some devices.

### 5. Root Cause
🎯 **The synchronized splash screen hide is occurring at a moment where the Android OS (especially MIUI) is attempting to perform a rendering operation (like a crossfade or view transition) using a software-only canvas, but the app content contains hardware-accelerated bitmaps (from `expo-image` or the native buffer).**

### 6. Fix Plan
1.  **Avoid `null` return in Root**: Instead of returning `null` in `StartupLogic`, return a `View` with the splash color to keep the hierarchy stable.
2.  **Soften the hide transition**: Increase the `setTimeout` slightly or use a more robust check.
3.  **Force Hardware Acceleration**: Ensure the root view explicitly supports hardware bitmaps by avoiding any software-render triggers (like specific shadow styles or off-screen drawing).

### 7. Prevention
🛡️ Avoid returning `null` at the root of a `Stack` or `Layout` when using native splash screens. Always provide a stable view hierarchy.
