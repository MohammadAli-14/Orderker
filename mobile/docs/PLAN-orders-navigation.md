# PLAN: Orders Navigation Refinement

This plan details the implementation of navigation from the "My Orders" screen directly to the "Product Detail" page when a user interacts with an order card.

## User Review Required

> [!IMPORTANT]
> **Navigation Strategy**: Clicking the main order card will navigate to the **first product** in that order (Option A). This ensures a direct path to a product detail page as requested.
> **Independent Actions**: Buttons like "Track Order" and "Leave Rating" will remain independent and will not trigger the product navigation.

## Proposed Changes

### [Mobile UI]

#### [MODIFY] [orders.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/app/(profile)/orders.tsx)
- Wrap the main horizontal `View` containing the product image and details with a `TouchableOpacity`.
- Implement navigation using `router.push` targeting the `productId` of the first item in the `orderItems` array.
- Set `activeOpacity` to a premium value (e.g., `0.7`) to provide high-quality touch feedback.
- Ensure the inner `View` layout remains consistent and doesn't break due to the wrapping.

---

## Verification Plan

### Manual Verification
1. **Direct Navigation**:
   - Open "My Orders".
   - Click on the product image or text in any order card.
   - **Expected**: Navigates to the "Product Detail" page for that specific product.
2. **Back Behavior**:
   - From the "Product Detail" page, click the back button.
   - **Expected**: Returns to the "My Orders" screen at the same scroll position.
3. **Button Isolation**:
   - Click the "Track Order" button.
   - **Expected**: Navigates to the tracking screen, NOT the product detail page.
   - Click "Leave Rating" (on delivered orders).
   - **Expected**: Opens the rating modal, NOT the product detail page.
4. **Empty States**:
   - Verify that navigation logic handles edge cases (e.g., order with no items, though this shouldn't happen in production).

### Automated Tests
- N/A for this UI-only change, manual verification is prioritized for visual/interaction feel.
