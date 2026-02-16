# Implementation Plan: User Dashboard Screen

Add a Dashboard tab to the Orderker mobile app. **All existing screens and tabs remain untouched.** New tab order: `Shop | Dashboard | Search | Cart | Wishlist | Account`.

## User Review Required

> [!IMPORTANT]
> The tab bar will have 6 items. Label font size will be reduced to `10px` to fit all tabs. This is a trade-off the user explicitly accepted.

---

## Proposed Changes

### Backend: Dashboard KPI Endpoint

#### [NEW] `GET /api/orders/dashboard-kpi`

Returns aggregated KPIs for the authenticated user:

```json
{
  "totalOrders": 12,
  "totalSpent": 15420,
  "deliveredOrders": 8,
  "pendingOrders": 2
}
```

Uses MongoDB `aggregate()` pipeline on the `Order` collection filtered by `clerkId`.

---

#### [MODIFY] [order.controller.js](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/backend/src/controllers/order.controller.js)

Add `getUserDashboardKPI` function:
- `totalOrders`: `countDocuments({ clerkId, status: { $ne: "cancelled" } })`
- `totalSpent`: `aggregate` sum of `totalPrice` where status != cancelled
- `deliveredOrders`: `countDocuments({ clerkId, status: "delivered" })`
- `pendingOrders`: `countDocuments({ clerkId, status: "pending" })`

#### [MODIFY] [order.route.js](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/backend/src/routes/order.route.js)

Add route **before** `/:id` to avoid collision:
```diff
+router.get("/dashboard-kpi", protectRoute, getUserDashboardKPI);
 router.get("/:id", protectRoute, getOrderById);
```

---

### Mobile: New Hook

#### [NEW] [useDashboard.ts](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/hooks/useDashboard.ts)

```typescript
// React Query hook for KPI data
useQuery({ queryKey: ["dashboard-kpi"], queryFn: ... })
```

**Orders list reuses existing `useOrders` hook** — no duplication.

---

### Mobile: New Dashboard Screen

#### [NEW] [dashboard.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/app/(tabs)/dashboard.tsx)

**Layout (top to bottom):**

1. **Header**: "My Dashboard" + greeting ("Hello, {name}!")
2. **KPI Cards Row** (4 cards, 2×2 grid):
   - Total Orders (bag icon, `#F3EEFA` bg)
   - Total Spent (wallet icon, `#F3EEFA` bg)
   - Delivered (checkmark icon, `#D1FAE5` bg)
   - Pending (clock icon, `#FEF3C7` bg)
3. **Orders Section Header**: "My Orders" title
4. **Orders FlatList**: Reuses exact same order card pattern as existing [orders.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/app/(profile)/orders.tsx) — image, status badge, price, rating/track buttons
5. **Pull-to-refresh** on entire screen

**Design tokens:** `#5E2D87` primary, white background, Plus Jakarta Sans font.

---

### Navigation: Add Dashboard Tab

#### [MODIFY] [_layout.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/app/(tabs)/_layout.tsx)

Add `dashboard` tab between `home` and `search`:

```diff
 <Tabs.Screen name="home" ... />
+<Tabs.Screen name="dashboard" options={{
+  title: "Dashboard",
+  tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
+}} />
 <Tabs.Screen name="search" ... />
```

Reduce `tabBarLabelStyle.fontSize` from `12` to `10` for 6-tab fit.

**No other tabs modified. No screens deleted.**

---

## File Summary

| Action | File | Description |
|--------|------|-------------|
| MODIFY | `order.controller.js` | Add `getUserDashboardKPI` |
| MODIFY | `order.route.js` | Add `GET /dashboard-kpi` |
| NEW | `hooks/useDashboard.ts` | React Query hook for KPIs |
| NEW | `app/(tabs)/dashboard.tsx` | Dashboard screen |
| MODIFY | `app/(tabs)/_layout.tsx` | Add Dashboard tab |

---

## Verification Plan

### Automated
- `npx tsc --noEmit` — TypeScript check

### Manual
- KPIs display correct counts matching order history
- Orders list matches Account → Orders exactly
- Pull-to-refresh works for both KPIs and orders
- All 6 tabs visible and functional
- Existing screens (Shop, Search, Cart, Wishlist, Account) unchanged
