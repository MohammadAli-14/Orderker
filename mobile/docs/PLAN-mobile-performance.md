# PLAN-mobile-performance.md

## Overview
Optimize the OrderKer mobile app loading sequence and general performance to ensure a premium, fast experience for users in Pakistan. The focus is on eliminating the "Double Splash" effect and reducing perceived latency.

## Project Type
**MOBILE** (Expo/React Native)

## Success Criteria
- [ ] No intermediate white screen/spinner between Native Splash and Home screen.
- [ ] Home screen content (Products) begins loading in parallel with Config.
- [ ] App feels interactive within < 3 seconds on warm start.

## Tech Stack
- **Frontend**: React Native, Expo, TanStack Query (React Query)
- **Backend**: Node.js, Render (for hosting)
- **Assets**: expo-splash-screen, expo-image

## File Structure (Affected Files)
- `app/_layout.tsx` (Initialization logic)
- `components/ConfigGuardian.tsx` (Maintenance/Update checks)
- `hooks/useConfig.ts` (Dynamic configuration)
- `app/(tabs)/home.tsx` (Dashboard loading)

## Task Breakdown

### Phase 1: UX Synchronization
- [ ] **Task 1: Synchronized Splash Stay**
  - **Action**: Modify `_layout.tsx` to include `useConfig` at the root and wait for `loaded` (fonts) AND `!configLoading` (app config) before calling `SplashScreen.hideAsync()`.
  - **Agent**: `mobile-developer`
  - **Verify**: Cold boot the app; the logo should stay until the app is fully ready.
- [ ] **Task 2: ConfigGuardian Cleanup**
  - **Action**: Remove the `ActivityIndicator` from `ConfigGuardian.tsx`.
  - **Agent**: `mobile-developer`
  - **Verify**: No white screen with purple spinner during startup.

### Phase 2: Data Pre-warming
- [ ] **Task 3: Parallel Product Fetching**
  - **Action**: Warm up the `useProducts` query in `_layout.tsx` (prefetching) so products are already in cache when `home.tsx` mounts.
  - **Agent**: `mobile-developer`
  - **Verify**: Home screen product grid appears almost instantly after splash.

### Phase 3: Infrastructure (Optional/Recommended)
- [ ] **Task 4: Backend Warm-up Strategy**
  - **Action**: Implement a "Ping" in the app's initial `useEffect` to wake up the Render server immediately upon app launch.
  - **Agent**: `mobile-developer`
  - **Verify**: Log backend response times on "First Open" vs "Second Open".

## Phase X: Final Verification
- [ ] **UX Audit**: Run `python .agent/skills/frontend-design/scripts/ux_audit.py .` to check for Fitts/Hick's law compliance.
- [ ] **Performance Profile**: Use Flashlight or manual stopwatch to measure "Time to Interactive".
- [ ] **Visual Check**: Ensure no layout shifts when images load (use `expo-image` placeholder).

## Agent Assignments
- **Primary Agent**: `mobile-developer` @[.agent/agents/mobile-developer.md]
- **Skills**: `mobile-design`, `performance-profiling`, `clean-code`
