import { Stack } from "expo-router";
import "../global.css";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import * as Sentry from "@sentry/react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { ToastProvider } from "@/context/ToastContext";
import { useApi } from "@/lib/api";
import Toast from "@/components/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";

Sentry.init({
  dsn: "https://fb6731b90610cc08333e6c16ffac5724@o4509813037137920.ingest.de.sentry.io/4510451611205712",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      Sentry.captureException(error, {
        tags: {
          type: "react-query-error",
          queryKey: query.queryKey[0]?.toString() || "unknon",
        },
        extra: {
          errorMessage: error.message,
          statusCode: error.response?.status,
          queryKey: query.queryKey,
        },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      // global error handler for all mutations
      Sentry.captureException(error, {
        tags: { type: "react-query-mutation-error" },
        extra: {
          errorMessage: error.message,
          statusCode: error.response?.status,
        },
      });
    },
  }),
});

import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

if (!clerkPublishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please set it in your environment."
  );
}

import ConfigGuardian from "@/components/ConfigGuardian";
import { useConfig } from "@/hooks/useConfig";
import useProducts from "@/hooks/useProducts";
import FlashSaleBanner from "@/components/FlashSaleBanner";

const ConfigConsumer = () => {
  const { data: config } = useConfig();
  const flashSale = config?.flashSale;

  if (!flashSale || (!flashSale.active && flashSale.status !== "SCHEDULED")) return null;

  return null;
};

// --- STARTUP LOGIC COMPONENT ---
// This component handles resource loading, config fetching, and splash screen timing.
function StartupLogic({ children, fontsLoaded, fontsError }: { children: React.ReactNode, fontsLoaded: boolean, fontsError: any }) {
  const { isSuccess: configSuccess, isError: configError, isLoading: configLoading } = useConfig();
  const api = useApi();

  // Pre-fetch products to warm the cache while the splash screen is still visible
  useProducts();

  useEffect(() => {
    // Backend Warm-up: Fire and forget a ping to the health endpoint
    // This wakes up the Render server if it's sleeping.
    const wakeUpBackend = async () => {
      try {
        await api.get("/health", { timeout: 10000 });
        console.log("[Performance] 📡 Backend wake-up ping sent.");
      } catch (e) {
        // Ignore errors, it's just a warm-up
      }
    };
    wakeUpBackend();
  }, []);

  useEffect(() => {
    // Hide splash screen ONLY when:
    // 1. Fonts are loaded (or failed)
    // AND
    // 2. Config is fetched (or failed/timed out)
    const isReady = (fontsLoaded || fontsError) && (!configLoading || configError || configSuccess);

    if (isReady) {
      // Small delay for smooth transition (increased for Android stability)
      // This ensures the first frame of the app is fully committed to the GPU
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {
          /* ignore hide errors */
        });
      }, 250); // Increased to 250ms for even better stability on MIUI
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fontsError, configLoading, configError, configSuccess]);

  // While we wait, we keep a stable white background to ensure hardware acceleration stays active
  if (!fontsLoaded && !fontsError) {
    return <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} renderToHardwareTextureAndroid={true}>
      {children}
    </View>
  );
}

export default Sentry.wrap(function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <StripeProvider publishableKey={stripePublishableKey}>
          <ToastProvider>
            <ErrorBoundary>
              <StartupLogic fontsLoaded={loaded} fontsError={error}>
                <ConfigGuardian>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
                      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FFFFFF" } }} />
                      <ConfigConsumer />
                    </View>
                  </GestureHandlerRootView>
                </ConfigGuardian>
              </StartupLogic>
            </ErrorBoundary>
            <Toast />
          </ToastProvider>
        </StripeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
});
