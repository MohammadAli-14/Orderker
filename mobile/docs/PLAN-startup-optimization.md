# Implementation Plan: Startup Performance Optimization

The objective is to eliminate the "Double Splash" effect and improve the perceived startup time of the OrderKer mobile app.

## Proposed Changes

### [Mobile] Root Layout & Initialization

#### [MODIFY] [_layout.tsx](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/mobile/app/_layout.tsx)
- **Synchronized SplashScreen**: Update the `useEffect` that hides the splash screen. It should now wait for:
    1. `useFonts` to be loaded.
    2. `useConfig` to have successful data or an error state.
- **Root-Level Config Hook**: Add `useConfig` hook call inside `RootLayout` (but after `QueryClientProvider`).
- **Pre-warming**: Since the splash screen stays visible during the config fetch, we eliminate the jarring transition to a separate loading spinner.

#### [MODIFY] [ConfigGuardian.tsx](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/mobile/components/ConfigGuardian.tsx)
- **Remove Blocking Spinner**: Remove the `if (isLoading)` return that shows the `ActivityIndicator`. Since the `RootLayout` now handles the splash screen timing, the app will only render once the config is ready.

### [Backend] Configuration Endpoint

#### [VERIFY] [config.controller.js](file:///e:/OrderKerEcommerceProject7Feb - Copy/expo-ecommerce/backend/src/controllers/config.controller.js)
- Ensure the `getAppConfig` controller is as efficient as possible. (Already checked, looks good but could benefit from a cache if traffic is high).

## Verification Plan

### Manual Verification
- **Cold Boot Performance**: Kill the app and restart it. Observe the transition from the Splash Screen.
    - **Expectation**: The splash screen should stay visible for a slightly longer moment (covering the config fetch) and then transit directly to the Home/Welcome screen without an intermediate spinner.
- **Offline Reliability**: Test startup without internet.
    - **Expectation**: Splash screen should hide once the 5s timeout in `useConfig` is reached, gracefully degrading to show the app content (as `ConfigGuardian` already does).

### Performance Metrics
- **Heuristic**: Perceived "Ready to Interaction" time should be smoother and feel faster.
