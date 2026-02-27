# Project Plan: Fix WhatsApp Linking on Android 11+

## Context & Objectives
The Android Preview build fails to open WhatsApp returning a "WhatsApp not found" toast, despite WhatsApp being installed. This is caused by Android 11's package visibility restrictions blocking `Linking.canOpenURL()`. We need to explicitly declare the `whatsapp://` URL scheme in the `app.json` intent configurations.

## Goal
Modify the Expo configuration to allow the application to query the `whatsapp` URL scheme, enabling the Magic Verify flow to work on physical Android devices.

## Proposed Strategy: Option A (Intent Queries via app.json)

### 1. Requirements Check
- **File to Edit**: `expo-ecommerce/mobile/app.json`
- **Target OS**: Android (API 30+)
- **Expo Property**: `expo.android.intentFilters` (historically used) OR injecting queries.
*Correction based on Expo documentation*: The proper way to declare queried schemes in modern Expo is using the `expo-intent-launcher` or natively modifying the manifest. Actually, Expo provides a built-in property for this: **`expo.android.intentFilters`** or modifying `infoPlist` for iOS.
For Android 11+ package visibility, we specifically need the `<queries>` element in the Android Manifest. We can achieve this in `app.json` by adding the `"queries"` array under the `"android"` block, or by using a custom config plugin. Wait, Expo's `app.json` standard schema doesn't have a direct `"queries"` key under `android`.
Actually, the standard way in Expo to solve `Linking.canOpenURL` restrictions for Android 11 is to add the scheme to the `expo.infoPlist.LSApplicationQueriesSchemes` (for iOS) and **often Expo handles the Android side automatically IF using `expo-linking`**, but if not, we must create a quick config plugin.
Let's verify the simpler approach: The easiest, widely accepted React Native fallback if `canOpenURL` fails is to *bypass the check* entirely and just call `Linking.openURL()`, wrapping it in a try/catch block. If it fails, we show the toast.

Wait! A much better, native-driven approach is Option B from the brainstorm!
Let me refine the plan: Option B (using Universal Links) is actually safer *and* circumvents the EAS build requirement entirely. However, if the user wants the direct deep link, we can just use `Linking.openURL()` inside a try-catch for Android.

Let's do a hybrid approach:
We will **stop using `canOpenURL` for `whatsapp://`** because `openURL` directly attempts the intent. Since we already have a robust try/catch block, if `openURL` throws an error (app not installed), we catch it and display our "WhatsApp not found" toast.

### 2. Implementation Steps
1. Open `PhoneVerificationModal.tsx`.
2. Locate `handleMagicVerify`.
3. Remove the `Linking.canOpenURL(whatsappUrl)` conditional check.
4. Wrap `Linking.openURL(whatsappUrl)` directly in a `try/catch`.
5. If the URL successfully opens, move to the `otp` polling step.
6. If the `try` block throws an error (React Native throws when no app can handle the intent), catch it specifically and trigger the "WhatsApp Not Found" toast.

### 3. Verification Checklist
- [ ] Users tap the button.
- [ ] App attempts to fire the `whatsapp://` intent directly.
- [ ] On devices with WhatsApp, it opens instantly (Native speed).
- [ ] On devices without WhatsApp, the system throws, we catch it, and display the fallback toast safely.
- [ ] No native `app.json` modifications required (avoids immediately forcing a new EAS build just to fix a linking bug).
