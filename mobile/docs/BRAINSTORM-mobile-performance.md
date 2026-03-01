## 🧠 Brainstorm: Mobile App Performance & Loading Optimization

### Context
The app experiences a "Double Loading" effect on startup (Splash Screen → White Screen with Spinner → App). Additionally, initial data fetching for products and categories can feel sluggish, likely due to backend cold starts and sequential request patterns.

---

### Option A: UI/UX Synchronized Loading (The "Butter-Smooth" Entry)
Keep the native splash screen visible until all critical "blocking" data is ready.

✅ **Pros:**
- Eliminates the jarring white screen and loading spinners.
- Professional "First Impression" (users see the branding until the app is truly ready).
- Simple to implement in `_layout.tsx`.

❌ **Cons:**
- The splash screen stays visible longer (doesn't actually "speed up" the code, just hides the slowness).

📊 **Effort:** Low

---

### Option B: Data Fetching & Parallelization (The "Code-Speed" Approach)
Move critical data fetching (Config, User Profile, and possibly first batch of Products) to a higher level in the component tree or use React Query prefetching.

✅ **Pros:**
- Actually reduces the total time to interactive (TTI).
- Parallelizes backend requests (Config + Products at once).
- Can combine with Skeleton screens for a modern, active feel.

❌ **Cons:**
- More complex implementation (need to handle partial failures carefully).
- Increases initial network load on the device.

📊 **Effort:** Medium

---

### Option C: Asset & Infrastructure Optimization (The "Foundation" Fix)
Optimize image delivery using WebP, Cloudinary resizing, and addressing backend wake-up times.

✅ **Pros:**
- Faster rendering of the Home screen (less data transferred for images).
- Resolves the root cause of the "5-second sleep" on Render.com.
- Improves performance globally (not just on startup).

❌ **Cons:**
- Requires backend changes and potential hosting upgrades (or a "ping" service).
- Less visible immediate "UI change" for the user.

📊 **Effort:** High (due to hosting/CDN adjustments)

---

## 💡 Recommendation

**Option A + B** because they provide the best balance of "Perceived Performance" (Smooth UI) and "Actual Performance" (Parallel fetching). I suggest we implement the Synchronized Splash Screen first, then look into prefetching the Home screen data while the splash is still up.

What direction would you like to explore?
