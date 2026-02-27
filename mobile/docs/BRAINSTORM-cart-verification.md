## 🧠 Brainstorm: Cart Verification Flow Optimisation

### Context
The user reports a UX bottleneck: whenever they proceed to checkout via the Shopping Cart, they are prompted to verify their WhatsApp number—*even if they have already verified their account*. 

### Root Cause Analysis (`cart.tsx`)
In `cart.tsx`, the `handleCheckout` function evaluates `isVerified` using this line:
```typescript
const isVerified = user?.publicMetadata?.isPhoneVerified === true;
```
**Why this fails**: In previous sprints, we migrated to a custom WhatsApp Backend flow. The source of truth for `isPhoneVerified` now lives in MongoDB, not exclusively in Clerk's `publicMetadata`. While we do attempt to sync Clerk in some places, it is often stale or empty. If `publicMetadata` is empty, `cart.tsx` assumes the user is unverified and completely blocks checkout by summoning the `PhoneVerificationModal`.

---

### Option A: Use the existing `useProfile` Hook (Recommended)
We already built a robust `useProfile()` hook that fetches the exact user payload from the `/users/me` backend endpoint. This payload includes the real, live `isPhoneVerified` boolean.

✅ **Pros:**
- Guarantees 100% accuracy by relying on the backend source of truth.
- Extremely easy to implement (just import the hook).
- Standardizes data access across `profile.tsx`, `account-info.tsx`, and `cart.tsx`.

❌ **Cons:**
- Requires a network request, but `useProfile` handles caching seamlessly.

📊 **Effort:** Very Low

---

### Option B: Force Clerk Sync on the Backend
Whenever a user is verified via the WhatsApp API, we make an extra API call from our Node.js server to Clerk's B2B API to forcefully inject `{ isPhoneVerified: true }` into the `publicMetadata`.

✅ **Pros:**
- Keeps Clerk as the ultimate single source of truth across the frontend.

❌ **Cons:**
- High effort. Requires setting up Clerk Secret Keys on the backend and writing webhook synchronization logic.
- Clerk's backend API has rate limits.

📊 **Effort:** High

---

## 💡 Recommendation

**Option A** is the undeniable best choice. We've already built the `useProfile` hook precisely for this kind of scenario. By adopting `useProfile()` in the cart screen, `cart.tsx` will recognize the authentic `isPhoneVerified` backend value, bypassing the verification modal entirely for verified users.
