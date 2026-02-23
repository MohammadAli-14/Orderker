# PLAN-category-switch-fix.md

## Context
After optimizing the `HomeScreen` to use `FlatList` for better performance, switching categories triggers a crash. The component attempts to call `scrollViewRef.current.scrollTo`, which is a `ScrollView` method, but the ref is now attached to a `FlatList`.

## Goals
- Fix the `TypeError` when switching categories.
- Maintain the auto-scroll functionality that brings the user to the product grid on category selection.
- Ensure type safety for the ref.

## Proposed Changes

### Frontend (Mobile)
- **[MODIFY] [home.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/app/(tabs)/home.tsx)**:
    - Update `scrollViewRef` type to accommodate `FlatList`.
    - Replace `.scrollTo({ y: ... })` with `.scrollToOffset({ offset: ... })`.
    - Add safety checks for the ref existence.

## Verification Checklist
- [ ] Select a category from the categories list.
- [ ] Verify the screen automatically scrolls to the "Just For You" section without crashing.
- [ ] Verify the scroll animation is smooth.
- [ ] Test switching between "All" and specific categories multiple times.
