# PLAN: Centralized Flash Sale Campaign (Premium Edition)

Implement a robust, scheduled campaign system that synchronizes sales events across the Orderker infrastructure.

## Phase 1: Backend (Core Infrastructure)

### [NEW] FlashSale Model
Create `src/models/FlashSale.js` with the following schema:
- `title`: String (e.g., "Midnight Madness")
- `startTime`: Date
- `endTime`: Date
- `status`: Enum (DRAFT, SCHEDULED, ACTIVE, FINISHED)
- `discountType`: Enum (INDIVIDUAL, GLOBAL)
- `globalDiscountPercent`: Number (Default: 0)
- `products`: Array of ObjectId (refs: 'Product')
- `bannerImage`: String (Cloudinary URL)

### [NEW] FlashSale Routes & Controller
- `POST /api/admin/flash-sale`: Create campaign
- `GET /api/admin/flash-sale`: List all campaigns
- `PUT /api/admin/flash-sale/:id`: Update campaign (schedule/products)
- `GET /api/config`: Update this to return the *currently active* FlashSale metadata.

### Logic (Middleware/Service)
Update the product fetching logic to:
1. Check if an active `FlashSale` exists.
2. If yes, for each product in the sale:
   - Apply `globalDiscountPercent` OR use product's `discountPercent`.
   - Force `isFlashSale = true`.
3. If no active sale, force all products to `isFlashSale = false` (server-side safety).

## Phase 2: Admin (Management UI)

### Sales Management Dashboard
- Create `src/pages/SalesManagement.tsx`.
- Table view of all campaigns with status badges.
- **Campaign Editor**:
  - Date/Time picker for Start/End.
  - Toggle between "Individual" and "Global" discount.
  - **Reliable Product Picker**: A searchable list/modal that lets admins toggle products into the campaign array.

## Phase 3: Mobile (Client Integration)

### App Configuration Sync
Update `hooks/useConfig.ts` and the `AppConfig` type to include:
```typescript
flashSale: {
  active: boolean;
  endTime: string;
  title: string;
  bannerImage?: string;
}
```

### Conditional Rendering
- **Home Screen**: If `flashSale.active` is false, hide the `FlashSaleSection` and `FlashSaleTimer` entirely.
- **Timer**: Initialize countdown using `flashSale.endTime` from the config.

## Phase 4: Verification

### Backend
- Unit tests for price calculation logic with high/low precedence.
- Integrity check: Ensure finished sales don't affect product prices.

### Frontend
- Verify Admin "Product Picker" handles large catalogs (pagination/search).
- Verify Mobile UI hides/shows correctly when toggling "Active" in Admin.

---

> [!IMPORTANT]
> This "Option A" approach removes the risk of "ghost sales" where products show legacy discounts without a timer. The Server becomes the absolute source of truth for Sale status.
