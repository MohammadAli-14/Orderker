
# 📝 Project Plan: Account Info & Address Evolution

**Slug**: `PLAN-account-address-evolution.md`

## Overview
This plan outlines the implementation of a premium Account Info experience and an integrated global address management system, as requested by the customer.

## Phase 1: Backend Foundation (The Core)
- [ ] **Data Model**: Update `User` schema in `user.model.js` to include:
    - `phoneNumber` (String)
    - `isPhoneVerified` (Boolean, default: false)
- [ ] **Profile API**: 
    - Create `GET /api/users/me` to fetch full profile.
    - Create `PUT /api/users/me` to update name, email, and phone.
- [ ] **OTP Infrastructure**: (Conceptual/Stub) Prepare for SMS verification logic.

## Phase 2: Account Info Screen (Premium UI)
- [ ] **New Screen**: `app/(profile)/account-info.tsx`.
    - [ ] **UI Style**: Glassmorphism header, Spotify-inspired themes.
    - [ ] **Information**: Display Name, Email, Phone, and Principal Shipping Address.
    - [ ] **Verification Badge**: 
        - Show "Verification Pending" (Amber/Muted) if `isPhoneVerified` is false.
        - Show "Verified Member" (Spotify Green) if true.
    - [ ] **Address Switcher**: Horizontal list or modal to select/switch between saved addresses.
    - [ ] **Security**: "Change Password" button (linking to Clerk security settings).

## Phase 3: Cart Address Selection Enhancement
- [ ] **AddressSelectionModal Update**: 
    - [ ] Add "New Address / Manual Entry" option.
    - [ ] Integrate a simplified `AddressForm` within the checkout flow.
    - [ ] Ensure seamless state sync between selection and order creation.

## Phase 4: Home Screen - Live Location Detection
- [ ] **Location Button**: Add a premium "Detect Location" icon/button in the Home header.
- [ ] **Integration**: Bind with `useLocationDetection` hook.
- [ ] **Modal**: Trigger `LocationSelectionModal` with live data results.

## Quality & Design Standards
- **Purple Ban**: Only use Brand Primary (#5E2D87) as accent; avoid violet/bright purple.
- **Micro-Animations**: Use `react-native-reanimated` for modal transitions.
- **Haptics**: Apply medium haptics on address selection and "Detect Location" trigger.
