# Plan: Fix 'Just For You' Product Layout

The "Just For You" products section currently uses `justify-between`, which causes the last row to space out items to the edges when there are only 2 products. This creates an unprofessional gap in the center. I will refactor the layout to use `justify-start` with a consistent gap to ensure items align from left to right.

## Proposed Changes

### [Component] [home.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/app/(tabs)/home.tsx)

#### [MODIFY] [home.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/app/(tabs)/home.tsx)
- Change the container's `justify-between` to `justify-start`.
- Add `gap-4` (or equivalent horizontal margin) to current items.
- Adjust item width to ensure 3 columns still fit perfectly.
- Currently: `w-[31.5%]` (total 94.5%) + `justify-between`.
- Proposed: `w-[30%]`, `gap-x-[5%]` with `justify-start`. Or simply use `gap-3` and a fixed percentage that fits.

> [!IMPORTANT]
> Since we are using NativeWind/Tailwind, I will test `gap-x-3` or `gap-3` which are supported in latest React Native versions.

## Verification Plan

### Manual Verification
1. Open the app on an Android/iOS emulator.
2. Navigate to the Home screen.
3. Scroll down to the "Just For You" section.
4. Verify that if there are 2 items in the last row, they are aligned to the left (one on the left, one in the center) instead of the edges.
5. Check responsiveness on different screen widths to ensure 3 columns remain consistent.

### Automated Tests
- Run `npm run lint` to ensure code style remains consistent.
- (Optional) Build the APK to verify layout on a physical device if emulator is unavailable.

Next steps:
- /create (to start implementation)
