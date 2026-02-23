import { useOAuth } from "@clerk/clerk-expo";
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

// Hook to warm up browser for better UX on Android
const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

function useSocialAuth() {
  useWarmUpBrowser();

  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);

  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setLoadingStrategy(strategy);

    const startFlow = strategy === "oauth_google" ? startGoogleFlow : startAppleFlow;

    try {
      const { createdSessionId, setActive } = await startFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (error) {
      const provider = strategy === "oauth_google" ? "Google" : "Apple";
      Alert.alert("Error", `Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setLoadingStrategy(null);
    }
  };

  return { loadingStrategy, handleSocialAuth };
}

export default useSocialAuth;
