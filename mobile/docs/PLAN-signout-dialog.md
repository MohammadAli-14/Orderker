# Project Plan: Signout Confirmation Dialog

## Context & Objectives
The user wants to implement a signout confirmation dialog box in the mobile application. The dialog should match the app's aesthetic (purple and white). It must appear when a user taps "Sign Out" to prevent accidental logouts.

## Goal
Implement a custom React Native modal or overlay to handle the signout confirmation process cleanly and consistently across both iOS and Android.

## Proposed Strategy: Custom Modal (Option B from Brainstorm)

### 1. Requirements Check
- **Platform**: Cross-platform (React Native/Expo).
- **Triggers**: User taps "Sign Out" from the Profile/Settings screen.
- **Action**: Opens a styled modal instead of logging out instantly.
- **Style**: Purple and White UI, large 44pt+ touch targets, clear secondary and primary actions.

### 2. State & Component Breakdown
- **Location**: Profile or Settings Screen.
- **State**: A boolean `isSignOutModalVisible` within the existing screen or context.
- **Modal Component Details**:
  - Semi-transparent dark overlay (e.g., `rgba(0,0,0,0.5)`).
  - White container with rounded corners (e.g., `borderRadius: 16`).
  - Title: "Sign Out" (Bold, dark text).
  - Description: "Are you sure you want to sign out of your account?" (Gray text).
  - Actions:
    - **Cancel Button**: Outlined / Gray text, acts as dismiss.
    - **Confirm Button**: Solid purple background (#5E2D87), white text, bold. Tapping this triggers the actual Clerk `signOut()` function.

### 3. Implementation Steps
1. Add state variable `showSignOut` to the Profile screen.
2. Update the "Sign Out" list-item/button `onPress` to `setShowSignOut(true)`.
3. Add the `<Modal>` block at the bottom of the Profile JSX content.
4. Add styles matching the required purple/white theme, ensuring Fitts' Law guidelines are fully met (min 48dp on Android / 44pt on iOS) for touch targets.
5. In the confirm button `onPress`, wrap the `signOut()` method and navigate to the Welcome screen afterward if necessary (usually Clerk auto-navigates).

### 4. Verification Checklist
- [ ] Tapping Sign Out opens the custom modal instead of logging out instantly.
- [ ] Tapping "Cancel" cleanly dismisses the modal without logging out.
- [ ] Tapping "Confirm" successfully logs the user out.
- [ ] The modal UI strictly uses the purple (`#5E2D87`) and white branding, bypassing defaults.
- [ ] Both buttons have safe, easily reachable touch zones (accessible via Thumb Zone).
- [ ] Works correctly regardless of offline/online state (logout clears tokens).
- [ ] Background properly blurs or dims to highlight the modal context.
