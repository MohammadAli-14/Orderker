# PLAN: Global Mobile Responsiveness Fix

## 📋 Problem Analysis
The Oppo A16E (and likely other budget/mid-range Android devices) is experiencing a "Footer Cut-off" where the bottom tab bar labels or the bar itself are partially hidden.

### 🔍 Root Causes
1. **Inconsistent SafeArea Insets**: On some Android skins (like ColorOS), the system might report a `bottom` inset of `0` even when a virtual navigation bar is present, causing our current logic `height: 60 + insets.bottom` to provide insufficient padding.
2. **Fixed Height Constraints**: Using `height: 60` with fixed paddings doesn't account for accessibility "Large Text" settings or varied aspect ratios.
3. **Viewport Overflow**: Horizontal components (Categories/Banners) may lack horizontal "breathing room" on narrow devices.

---

## 🛠️ Proposed Solution

### 1. Robust Tab Bar Scaling
Instead of raw addition, we will implement a "Smart Bottom Padding" that uses a minimum threshold even when insets are zero.

### 2. Device-Agnostic Layouts
- **Home Screen**: Replace remaining hardcoded pixel widths with `flex` or percentage-based dimensions.
- **Typography**: Verify `allowFontScaling={false}` on critical UI elements like Tab Labels to prevent layout breakage.

---

## 📅 Task Breakdown

### Phase 1: Navigation Overlay Fix
- [ ] **Adjust (tabs)/_layout.tsx**: Implement a adaptive height logic for the TabBar.
- [ ] **Standardize Insets**: wrap root views in `SafeAreaView` where manual padding is brittle.

### Phase 2: Horizontal Responsiveness
- [ ] **Home Screen Categories**: Ensure `FlatList` or `ScrollView` uses proper content padding rather than fixed margins.
- [ ] **Banners**: Adjust banner aspect ratio calculations to avoid cropping on narrow screens.

### Phase 3: Global Audit
- [ ] **Test** on extra-wide (Pixel XL) and extra-narrow (iPhone SE/Budget Android) coordinates.

---

## 🧪 Verification Plan

### Automated
- Use `npm test` if layout tests exist.

### Manual (Visual Audit)
1. **Oppo A16E Check**: Verify footer visibility with both Gesture and Button navigation.
2. **Small Screen Check**: Verify category icons don't wrap awkwardly.
3. **Large Screen Check**: Verify center-alignment of hero sections.

---
> [!IMPORTANT]
> This plan focuses on "Safe Zone" compliance which is critical for Production-Ready status.
