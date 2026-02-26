# Project Plan: Connect Signout Modal

## Context & Objectives
The custom `ConfirmModal` state was added to `profile.tsx`, but the component was not rendered and the trigger button was not updated. The goal is to connect these pieces so the purple/white branded sign-out dialog actually appears.

## Goal
Implement the missing JSX and `onPress` bindings in `profile.tsx` to fix the sign-out confirmation flow.

## Proposed Strategy: Option A

### 1. Requirements Check
- **File**: `expo-ecommerce/mobile/app/(tabs)/profile.tsx`
- **Missing Elements**:
  - `onPress` binding on the Sign Out button.
  - Rendering of `<ConfirmModal />`.

### 2. Implementation Steps
1. Locate the `<TouchableOpacity>` for the "Sign Out" button.
2. Change its prop from `onPress={() => signOut()}` to `onPress={() => setShowSignOutConfirm(true)}`.
3. Add the `<ConfirmModal>` component immediately after the main `ScrollView` inside the `SafeScreen`.
4. Configure the `<ConfirmModal>` props:
   - `visible={showSignOutConfirm}`
   - `onClose={() => setShowSignOutConfirm(false)}`
   - `onConfirm={handleSignOut}`
   - `title="Sign Out"`
   - `message="Are you sure you want to sign out of your account?"`
   - `confirmLabel="Sign Out"`
   - `cancelLabel="Cancel"`
   - `isDestructive={true}`
   - `loading={isSigningOut}`

### 3. Verification Checklist
- [ ] Tapping "Sign Out" triggers `setShowSignOutConfirm(true)`.
- [ ] The `ConfirmModal` renders over the screen.
- [ ] Tapping "Cancel" dismisses the modal.
- [ ] Tapping "Sign Out" inside the modal triggers `handleSignOut` and correctly logs the user out.
