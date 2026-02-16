
# 📝 Project Plan: Address System Evolution

**Slug**: `PLAN-address-system-evolution.md`

## Overview
This plan focuses exclusively on upgrading the address management and user information display. It addresses the customer's request for a premium Account Info screen, flexible address entry in the Cart, and enhanced live location tracking.

## Phase 1: Account Info Screen (Central Hub)
- [ ] **Implementation**: Create `app/(profile)/account-info.tsx`.
- [ ] **Data Display**: Show Name, Email, and Phone number.
- [ ] **Shipping Section**:
    - Display current "Principal Address".
    - **Change/Switch**: Add a "Change" button that opens `AddressSelectionModal`.
    - Allow switching between multiple addresses instantly.
- [ ] **Design**: Use a high-end, theme-consistent UI with Glassmorphism and brand fonts.

## Phase 2: Checkout (Cart) Flexibility
- [ ] **AddressSelectionModal Update**: 
    - [ ] Add an "Add New Address / Manual Entry" item at the top/bottom of the list.
    - [ ] If selected, open `AddressFormModal` directly from the checkout flow.
- [ ] **User Experience**: Ensure users don't have to leave the Cart to add a new shipping destination.

## Phase 3: Home Screen - Live Geocoding
- [ ] **Live Location Enhancement**: 
    - Improve the "Detect Location" trigger in the Home header.
    - Ask the user if they want to save the detected geocoded address as their "Current Delivery Address".
- [ ] **Visual Feedback**: Show a distinctive "Live" badge when an address is detected via GPS.

## Phase 4: Backend Refinement
- [ ] **Sync**: Ensure `User` model addresses are always in sync with these UI changes.
- [ ] **Verification**: Add a "Verification Pending" placeholder for phone numbers (logic-only for now, to be integrated with SMS later).

## Quality & Design
- **Purple Ban**: Avoid violet; stick to Orderker Brand Primary (#5E2D87) and Spotify Green (#1DB954).
- **Haptics**: Integration of haptic feedback for all address switches.
- **Zero Placeholders**: Fetch all initial data from `useUser` and `useAddresses`.
