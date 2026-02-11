# Plan: Location UI Sync & Mutual Exclusion (Orderker)

## 🎯 Goal
Synchronize the detected live location with the UI properly, handle "Outside Karachi" (e.g., Rawalpindi) detections professionally, and implement a "Manual vs Auto" mutual exclusion logic.

## 🔍 Problem Analysis
- **Current State**: Live location detection logs "Rawalpindi" but the UI defaults to "Karachi East" because Rawalpindi is not in the delivery zones.
- **UI Issue**: The Home screen header doesn't always reflect the *newly* saved location instantly if the modal closes before the state propagate.
- **UX Goal**: When "Auto-Detect" is active, manual chips should be disabled to prevent confusion and show a "Live" badge.

## 🛠️ Proposed Solution

### 1. State Hub Coordination
Modify `LocationSelectionModal.tsx` and `useLocationDetection.ts` to support 3 modes:
- `manual`: User explicitly clicked a chip.
- `auto`: User clicked "Detect My Location".
- `outside`: Location detected but outside our delivery zones.

### 2. Handling Outside Areas (e.g., Rawalpindi)
Update `useLocationDetection.ts` to return an `isOutside` flag.
- **UI**: If `isOutside` is true, the header will show "**Rawalpindi (Limited Service)**" instead of defaulting to a fake Karachi zone.

### 3. Mutual Exclusion UI (Frontend Specialist)
In `LocationSelectionModal.tsx`:
- When `detecting` or `mode === 'auto'`, the Zone/Area chips will be:
  - Opacity: 0.5
  - `pointerEvents: 'none'`
- Ad a **"Clear / Switch to Manual"** button if `mode === 'auto'` to re-enable selection.

### 4. UI Synchronization (Frontend Specialist)
- Ensure `onLocationUpdate` is called with the *full* address details if needed.
- Use a `LocationContext` (optional but recommended) or ensure `home.tsx` listens to `AsyncStorage` updates more robustly.

## 📋 Implementation Phases

### Phase 1: Logic Update (Backend/Logic)
- [ ] Update `useLocationDetection.ts` to return `isServiceable: boolean`.
- [ ] Update mapping to preserve the actual city name even if not serviceable.

### Phase 2: UI Enhancements (Frontend)
- [ ] Implement the "Lock" state in `LocationSelectionModal.tsx` for chips.
- [ ] Add a "Verified Live" badge/icon to the selected location in the modal and home header.
- [ ] Add "Switch to Manual" button.

### Phase 3: Home Sync
- [ ] Update `home.tsx` header to handle the `isServiceable` state (e.g., change text color or add warning icon).

## ✅ Verification Checklist
- [ ] Verify that clicking "Manual" after "Auto" works (Mutual exclusion).
- [ ] Verify that Rawalpindi shows as "Rawalpindi (Limited Service)".
- [ ] Verify Home header updates instantly after saving in Modal.
