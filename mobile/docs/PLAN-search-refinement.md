# PLAN-search-refinement.md

Refine the Search Screen to be a central discovery hub for Orderker, featuring live results and deep-linked categories.

## Overview
The goal is to move from a static search UI to a dynamic, functional hub. This involves implementing real-time results, connecting "Popular Categories" to the Home screen's filtering system, and adding a "Trending" section to boost conversion.

## Success Criteria
- [ ] Typing in Search bar shows filtered product list immediately.
- [ ] Tapping a category navigates to Home with that category selected.
- [ ] "Trending Products" section appears on empty search state.
- [ ] Search results use `ProductCard` with full cart/wishlist integration.

## Architecture & Logic
- **Search State**: Local state in `search.tsx` will filter `useProducts` data.
- **Navigation Params**: Use `router.push('/(tabs)/home?category=dairy')` for category routing.
- **Home Hook**: Update `home.tsx` to read `useLocalSearchParams` and sync `selectedCategory` state.

## Task Breakdown

### Phase 1: Home Screen Parameters
- **Task**: Update `home.tsx` to check for `category` query parameter.
- **Agent**: `mobile-developer`
- **Output**: `home.tsx` updated to sync `selectedCategory` state with URL params.

### Phase 2: Live Search Implementation
- **Task**: Fetch products in `search.tsx` using `useProducts`.
- **Task**: Filter products by `searchText` in real-time.
- **Task**: Display results in a grid using `ProductCard`.

### Phase 3: Category Routing & Trending
- **Task**: Connect "Popular Categories" to navigate to Home with query params.
- **Task**: Implement "Trending Items" (top 4 rated products) on the search landing state.

### Phase 4: Verification
- Search for "Olpers" and verify results appear instantly.
- Click "Dairy" category and verify Home screen filters to Dairy.
- Verify wishlist/cart actions work directly from search results.
