# PLAN: Custom Popup Refinement

This plan outlines the steps to replace the disjointed native alerts with a cohesive, premium notification system.

## 1. Core Infrastructure
- [ ] Create `components/Toast.tsx` with Reanimated animations.
- [ ] Create `context/ToastContext.tsx` for global state management.
- [ ] Add `ToastProvider` to `app/_layout.tsx`.

## 2. Component Design
- **Theme**: Dark glassmorphism with Spotify Green (`#1DB954`) accents for success.
- **Position**: Floating toast at the top (under safe area) or bottom.
- **Feedback**: Add haptic feedback using `expo-haptics`.

## 3. Integration
- [ ] Refactor `handleAddToCart` in `product/[id].tsx`.
- [ ] Refactor `handleSubmit` in `payment/verification.tsx`.
- [ ] Refactor checkout logic in `cart.tsx`.

## 4. Verification
- [ ] Test success animations.
- [ ] Test error state styling.
- [ ] Ensure no blocking of UI interactions.
