## 🧠 Brainstorm: Performance Verification & Preview APK

### Context
We have implemented several deep performance optimizations (Splash synchronization, prefetching, backend warm-up, and rendering stability). To verify these in a real-world scenario, we need to decide on the next verification step.

---

### Option A: Immediate Preview APK (EAS Build)
Generate a new Android APK via `eas build -p android --profile preview`.

✅ **Pros:**
- **Real Hardware Test**: The "Hardware Bitmap" crash is device-specific (Android/MIUI). This is the only way to be 100% sure it's fixed.
- **Production Performance**: Verifies the app WITHOUT the overhead of the Metro bundler and development mode.
- **Sharable**: Can be sent to testers immediately.

❌ **Cons:**
- Takes 5-10 minutes for the cloud build.

📊 **Effort:** Low (Automation)

---

### Option B: Backend Indexing & Hardening
Before building the APK, add MongoDB indices to the `Product` model for `category`, `price`, and `isFlashSale`.

✅ **Pros:**
- **Scalability**: Prevents the backend from slowing down as more products are added.
- **Query Speed**: Makes the prefetching requests even faster.

❌ **Cons:**
- Very minor overhead for write operations (insignificant for this scale).

📊 **Effort:** Low

---

### Option C: Performance Monitoring (Sentry Tracing)
Enhance the Sentry configuration to track TTI (Time to Interactive) and frame drops in production.

✅ **Pros:**
- **Data-Driven**: Gives you actual metrics from users' devices.

❌ **Cons:**
- Adds slight bundle size and complexity.

📊 **Effort:** Medium

---

## 💡 Recommendation

**Option B then Option A.** 

I recommend we quickly add the missing MongoDB indices to ensure the backend stays fast, and then immediately trigger a **Preview APK build**. Testing on real hardware is the most critical step right now to confirm the "Hardware Bitmap" fix is solid.

What direction would you like to explore?
