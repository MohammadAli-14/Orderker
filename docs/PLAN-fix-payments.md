# PLAN-fix-payments

## 1. Context Analysis
- **Goal**: Resolve compilation errors in `mobile/app/(tabs)/cart.tsx` and ensure Easypaisa/JazzCash payment flows are robust.
- **Current State**: 
    - `cart.tsx` had missing imports (`axios`) and type errors in catch blocks.
    - Manual payment logic (image upload + order creation) was implemented but unverified due to build errors.
- **Implementation Choice**: Option A (Direct Import & Type Guarding) - robust and standard for React Native + Axios.

## 2. Technical Strategy
### Phase 1: Fix Compilation Errors (Completed)
- **Action**: Imported `axios` in `cart.tsx`.
- **Action**: Updated `catch (error)` blocks with `axios.isAxiosError` type guards for safe property access.

### Phase 2: Native Capabilities (Completed)
- **Action**: Added `expo-image-picker` to `mobile/app.json` plugins.
- **Action**: Included `photosPermission` description to prevent crashes on iOS/Android.

### Phase 3: Logic Optimization (Completed)
- **Action**: Refined `uploadReceipt` in `cart.tsx` to normalize URIs (removing `file://` on iOS) and automatically detect mime types from file extensions.
- **Action**: Added backend logs in `order.controller.js` to trace receipt data on arrival.

## 3. Verification Checklist
- [ ] **Compilation**: App should load without "Cannot find name 'axios'" error.
- [ ] **Permissions**: Image picker should trigger a permission prompt on first use.
- [ ] **Upload Flow (Manual)**:
    - Select Easypaisa.
    - Pick image.
    - Submit order.
    - Verify backend log shows the Cloudinary URL.
- [ ] **Admin Flow**:
    - Verify new order appears in Admin Dashboard with "Easypaisa" method.
    - Click "View Receipt" and confirm image opens.

## 4. Next Steps for User
1. Restart Metro Bundler with cache clear: `npx expo start -c`
2. Perform a test checkout using Easypaisa.
3. Check the backend console for order creation logs.
