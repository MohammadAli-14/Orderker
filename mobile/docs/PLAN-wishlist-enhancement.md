# PLAN-wishlist-enhancement.md

Comprehensive enhancement of the Wishlist experience and global UI alignment auditing.

## Goals
1. Synchronize and unify both Wishlist screens (Tabs and Profile).
2. Implement functional feedback (Alerts) for Add to Cart and Delete actions.
3. Fix header alignment and "Top UI" spacing issues.
4. Perform a global UI audit and fix alignment inconsistencies across the app.

## Proposed Changes

### [Screen] Tab Wishlist (`app/(tabs)/wishlist.tsx`)
- **[MODIFY] [wishlist.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/app/(tabs)/wishlist.tsx)**
    - Refactor header to match the `cart.tsx` and `search.tsx` alignment (SafeScreen + standard headers).
    - Add `Alert.alert` feedback for `handleAddToCart`.
    - Add `Alert.alert` confirmation for `removeFromWishlist`.
    - Add `ActivityIndicator` (loaders) on "Add to Cart" buttons to show active progress.

### [Screen] Profile Wishlist (`app/(profile)/wishlist.tsx`)
- **[MODIFY] [wishlist.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/app/(profile)/wishlist.tsx)**
    - Ensure styling is identical to the Tab version for consistency.
    - Synchronize feedback logic.

### [Global] UI Audit
- **[SCAN] Global UI Alignment**
    - Check headers in `home.tsx`, `search.tsx`, `cart.tsx`, and `profile.tsx`.
    - Ensure consistent use of `SafeScreen` or `SafeAreaView`.
    - Fix any "hidden" or "floating" icons that break the visual grid.

## Verification Plan

### Manual Verification
1.  **Wishlist (Tab & Profile)**:
    *   Verify header alignment matches other screens.
    *   Test "Add to Cart": Loader should appear, followed by success Alert.
    *   Test "Delete": Confirmation Alert should appear before removal.
2.  **Global Audit**:
    *   Verify headers on Home, Search, and Cart screens are vertically aligned consistently (Back buttons, Titles, Action icons).
