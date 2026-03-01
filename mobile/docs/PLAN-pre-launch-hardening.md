# PLAN-pre-launch-hardening.md

## Overview
Final hardening of the backend performance and triggering the Preview APK build to verify all recent optimizations.

## Proposed Changes

### [Component] Backend Indexing
#### [MODIFY] [product.model.js](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/backend/src/models/product.model.js)
- Add indices for `category`, `price`, and `isFlashSale` to ensure high-speed filtering for the mobile app's prefetching calls.

### [Component] Mobile Release Prep
#### [VERIFY] [app.json](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/mobile/app.json)
- Ensure versioning is correct (Current: 3.0.0).
- Ensure assets (icon/splash) are properly linked.

#### [EXECUTE] Preview Build
- Run `eas build -p android --profile preview` to generate the APK.

## Verification Plan
1. **Index Test**: Verify DB queries use the new indices (Explain Plan).
2. **Real Device Test**: Install the generated APK on an Android device and verify the splash screen transition is smooth and crash-free.
