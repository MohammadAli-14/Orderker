# Plan: Live Location Implementation (Orderker)

## 🎯 Goal
Implement live location detection to automatically suggest the user's delivery Zone and Area, while maintaining the manual selection as a backup.

## 🔍 Problem Analysis
- **Current State**: Users must manually select "Zone" and "Area" from dropdowns.
- **Goal State**: A "Use Current Location" button that auto-detects the user's position and maps it to the correct zone/area.
- **Challenge**: Converting GPS (Lat/Long) to internal Zone names requires reverse geocoding.

## 🛠️ Proposed Solution (Hybrid Approach)
Keep the existing `LocationSelectionModal` but add a **"📍 Detect My Location"** button at the top.

### Technical Stack
1. **Library**: `expo-location` (Industry standard for Expo).
2. **Reverse Geocoding**: 
   - Option A: `Location.reverseGeocodeAsync` (Built-in, uses Apple/Google system services, free).
   - Option B: Google Maps API (More accurate in Pakistan, but requires credit card/billing).
   - **Recommendation**: Start with Option A (Free) and fallback to manual.

## 📋 Implementation Phases

### Phase 1: Environment Setup
- Install dependencies: `npx expo install expo-location`
- Add location permissions to `app.json` (iOS Purpose String, Android Permissions).

### Phase 2: Logic Layer
- Create a `useLocationDetection` hook.
- Implement permission request logic.
- Implement fallback for denied permissions or disabled GPS.

### Phase 3: Reverse Geocoding Integration
- Convert Lat/Long to human-readable address.
- Create a mapping utility to match addresses (e.g., "Malir Cantt") to the project's internal Zone/Area lists.

### Phase 4: UI Development (Frontend Specialist)
- Add "Detect My Location" button with a loading spinner to `LocationSelectionModal.tsx`.
- Add permission error handling UI.
- Ensure the Deep Purple theme is maintained.

### Phase 5: Backend Synchronization (Backend Specialist)
- Ensure the API handles location-based filtering if needed in the future.
- Optional: Store user's last detected coordinates in the profile for heat-map analytics.

## ✅ Verification Checklist

### Automated Tests
- [ ] Mock permission denial and verify fallback.
- [ ] Mock successful geocoding and verify zone selection.

### Manual Verification
- [ ] Test on Physical Device (Android & iOS).
- [ ] Verify "Location Denied" UX.
- [ ] Verify location change persistence in `AsyncStorage`.

## ⚠️ Risks & Mitigation
- **Permission Denied**: Mitigated by keeping the manual selection.
- **Inaccurate Geocoding**: Mitigated by letting users "Confirm/Edit" after detection.
- **Battery Drain**: Use `getCurrentPositionAsync` (single grab) instead of `watchPositionAsync` (continuous).
