# PLAN-hardware-bitmap-fix.md

## Overview
Resolve the "Software rendering doesn't support hardware bitmaps" error on Android by stabilizing the root view hierarchy and the splash screen transition timing.

## Problem
Currently, `StartupLogic` returns `null` while fonts are loading. This prevents React Native from creating a hardware-accelerated root canvas early enough. When the splash screen hides, any incoming images (`expo-image`) trigger a crash because they are hardware-backed and the OS falls back to a software snapshotter.

## Proposed Changes

### [MODIFY] [_layout.tsx](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/mobile/app/_layout.tsx)
- **Stable Root View**: Replace `return null` in `StartupLogic` with a full-screen white `View`.
- **Extended Transition**: Increase the `setTimeout` for `SplashScreen.hideAsync()` to 150ms to ensure the first frame of the app is fully rendered and the OS is ready.
- **Hardware Texture Hint**: Add `renderToHardwareTextureAndroid={true}` to the root view to explicitly signal hardware preference to the OS.

## Verification Plan
- **Cold Boot Test**: Re-run the app on the affected Android device.
- **Log Monitoring**: Check if the "Software rendering" error persists.
- **Success Criteria**: App loads directly to the Welcome/Home screen without crashing.
