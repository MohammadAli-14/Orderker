# PLAN-category-refinement.md

Analysis and implementation plan for category refinement and navigation optimization in the Search screen.

## Goals
1. Remove "Hygiene" category from mobile UI.
2. Replace it with "Personal Care" (matching the actual backend dataset).
3. Update `RECENT_SEARCHES` in the Search screen.

## Proposed Changes

### [Component] Search Screen (`search.tsx`)
- **[MODIFY] [search.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/app/(tabs)/search.tsx)**
    - Change `{ id: "hygiene", name: "Hygiene", icon: "medkit-outline" }` to `{ id: "personal care", name: "Personal Care", icon: "medkit-outline" }`.
    - Update `RECENT_SEARCHES`: Change `"Organic Eggs"` to `"Eggs"`.

### [Component] Home Screen (`home.tsx`)
- **[MODIFY] [home.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/app/(tabs)/home.tsx)**
    - Update `getCategoryIcon` to support `"personal care"`.
    - Update `MOCK_PRODUCTS` to use `category: "personal care"` instead of `"hygiene"`.

## Verification Plan

### Manual Verification
1.  **Search Screen**: Check if "Personal Care" appears in Popular Categories.
2.  **Recent Searches**: Verify "Eggs" appears instead of "Organic Eggs".
3.  **Navigation**: Click "Personal Care" and verify it filters products correctly on the Home screen.
