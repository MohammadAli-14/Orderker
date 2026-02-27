# Project Plan: Fix Cart Verification Block

## Context & Objectives
Verified users are currently being blocked at checkout due to the Shopping Cart relying on stale Clerk `publicMetadata`. We need to switch the cart's verification check to use the live backend profile data.

## Goal
Integrate the `useProfile` hook into `cart.tsx` so the "Checkout" button accurately respects the user's `isPhoneVerified` status from the backend database.

## Proposed Strategy: Option A (useProfile Hook)

### 1. Requirements Check
- **Target File**: `expo-ecommerce/mobile/app/(tabs)/cart.tsx`
- **Missing Dependency**: `useProfile` from `@/hooks/useProfile`.

### 2. Implementation Steps
1. Import `useProfile` at the top of `cart.tsx`: 
   `import { useProfile } from "@/hooks/useProfile";`
2. Initialize the hook at the top of the `CartScreen` component:
   `const { profile, isLoading: isProfileLoading } = useProfile();`
3. Refactor the `handleCheckout` function:
   - *Remove*: `const isVerified = user?.publicMetadata?.isPhoneVerified === true;`
   - *Replace With*: `const isVerified = profile?.isPhoneVerified === true;`
4. (Optional) Safely wait for profile to load before allowing checkout. If `isProfileLoading` is true, checkout can be briefly delayed or ignored.

### 3. Verification Checklist
- [ ] Cart component imports the backend profile without crashing.
- [ ] Users who are verified in MongoDB (`isPhoneVerified: true`) can tap "Checkout" and immediately see the Address Selection Modal.
- [ ] Unverified users still correctly see the Phone Verification Modal.
