# PLAN-production-ready-miui-fix.md

## Overview
Harden the app for production by eliminating MIUI-specific rendering crashes and optimizing for Android stability without sacrificing iOS aesthetics.

## Proposed Changes

### [Component] Home Screen Header
#### [MODIFY] [home.tsx](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/mobile/app/(tabs)/home.tsx)
- **Android Compatibility**: Replace `BlurView` with a standard `View` + high-opacity background on Android.
- **Why**: `BlurView` on Android often triggers a software-layer snapshot which is incompatible with hardware-backed bitmaps (Hardware Bitmaps), causing the reported crash.

### [Component] Startup Flow
#### [MODIFY] [_layout.tsx](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/mobile/app/_layout.tsx)
- **Safe Hide**: Add a secondary check to ensure `Splashscreen.hideAsync()` is only called when the `Home` or `Landing` screen is truly mounted and has rendered its first hardware frame.
- **Double-Layer Protection**: Ensure `renderToHardwareTextureAndroid={true}` is applied specifically to views containing multiple `expo-image` components.

### [Component] Image Strategy
#### [MODIFY] [ProductCard.tsx](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/mobile/components/ProductCard.tsx)
- Ensure all `expo-image` components use a consistent `transition` and `placeholder` strategy to reduce rapid buffer swapping during early mounting.

## Verification Plan
1. **Metro Logs**: Verify no `onHwBitmapInSwMode` warnings.
2. **Android Device Testing**: User to verify on their Xiaomi/MIUI device.
3. **EAS Preview**: Build a new APK to verify in a standalone environment.
