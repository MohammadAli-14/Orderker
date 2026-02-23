# WALKTHROUGH: Centralized Flash Sale Campaign

I have successfully implemented the **Centralized Flash Sale Campaign** across the entire Orderker ecosystem. This moves the platform from a manual, per-product toggle to a robust, event-driven campaign model.

## 🚀 Key Achievements

### 1. Backend: Event-Driven Logic
- **New Model**: Created `FlashSale` schema to handle scheduled timing, status (Draft/Active), and discount strategies.
- **Dynamic Overrides**: Implemented `applyFlashSaleLogic` utility that automatically applies discounts and sale flags based on the clock.
- **Config Sync**: Updated the `/config` endpoint to provide the mobile app with real-time campaign metadata (timers, titles, banners).

### 2. Admin: Sales Dashboard
- **Management Center**: Built a dedicated "Sales Management" page in the Admin panel.
- **Campaign Editor**: Admins can now schedule start/end times with minute-precision.
- **Smart Product Picker**: A searchable interface to easily select which products participate in a sale.
- **Flexible Discounts**: Toggle between "Global %" (all items same discount) and "Individual" (using product-level settings).

### 3. Mobile: Real-Time Synchronization
- **Dynamic Timer**: The `FlashSaleTimer` now counts down to the *real* event end time, not just midnight.
- **Automatic Visibility**: The entire Flash Sale section automatically appears when a campaign starts and disappears when it ends.
- **Data Continuity**: Products show the correct sale price and original price based on the active campaign.

## 🛠️ Components Updated

### Backend
- [flashSale.model.js](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/backend/src/models/flashSale.model.js)
- [flashSale.controller.js](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/backend/src/controllers/flashSale.controller.js)
- [productUtils.js](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/backend/src/utils/productUtils.js)
- [server.js](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/backend/src/server.js)

### Admin
- [SalesManagementPage.jsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/admin/src/pages/SalesManagementPage.jsx)
- [Sidebar.jsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/admin/src/components/Sidebar.jsx)

### Mobile
- [home.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/app/(tabs)/home.tsx)
- [FlashSaleSection.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/components/home/FlashSaleSection.tsx)
- [FlashSaleTimer.tsx](file:///e:/OrderKerEcommerceProject7Feb%20-%20Copy/expo-ecommerce/mobile/components/FlashSaleTimer.tsx)

## 6. Refinement & Automation (New)

We have enhanced the system to be fully automated and high-performance.

### 6.1 Backend Automation
- **Cron Job**: A background worker (`flashSale.worker.js`) now runs every minute.
    - Activates sales when `startTime` is reached.
    - Finishes sales when `endTime` is reached.
    - No manual intervention required.

### 6.2 Mobile Experience
- **Sticky Banner**: A global sticky banner appears at the bottom of the screen.
    - **Active Sale**: Red background, "Ends In" timer.
    - **Upcoming Sale**: Blue background, "Starts In" timer.
- **Coming Soon**: The home screen section now displays specific styling for upcoming sales to build hype.

### 6.3 Performance
- **Caching**: Implemented in-memory caching for the extensive `applyFlashSaleLogic` function to reduce database load during high traffic.
- **Overlap Prevention**: The Admin UI now intelligently detects conflicts and disables products that are already scheduled in overlapping campaigns.

---

## 🏁 Verification Steps Run
- [x] **Backend Logic**: Verified that finishing a sale in DB immediately clears the discount on products.
- [x] **Admin UI**: Verified product selection persistence and scheduling validation.
- [x] **Mobile UI**: Verified the section disappears when `active: false` is returned in config.

> [!TIP]
> You can now test this by creating a campaign in the Admin panel, setting it to **Active**, and opening the Mobile app. The timer will synchronize immediately!
