# Repairing Cart and Product Detail Functionality (Phase 12)

Fixing UI visibility issues (icons), functional bugs in cart management, and ensuring a seamless user experience.

## Proposed Changes

### [Component] Product Detail (`product/[id].tsx`)
- **[MODIFY] [product/[id].tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/app/product/[id].tsx)**
    - Fix `-` (minus) icon visibility by adjusting its color to contrast with the background.
    - Improve `+` (add) icon color for better contrast on the primary purple background.

### [Screen] Cart (`cart.tsx`)
- **[MODIFY] [cart.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/app/(tabs)/cart.tsx)**
    - Remove `opacity: 0` from the back arrow in the header.
    - Implement navigation back functionality for the back arrow.
    - Connect the header trash icon to `clearCart` with a confirmation alert.
    - Add a "Remove" button (trash icon) to each individual cart item.
    - Fix quantity adjustment buttons to ensure they are responsive and correctly call `updateQuantity`.

## Verification Plan

### Manual Verification
1.  **Product Detail**: Open a product, verify both `+` and `-` icons are clearly visible and functional.
2.  **Cart Screen**:
    *   Verify the back arrow is visible and navigates back.
    *   Verify the header trash icon clears the entire cart after confirmation.
    *   Verify each item can be removed individually.
    *   Verify `+` and `-` buttons correctly update the quantity in the cart.
