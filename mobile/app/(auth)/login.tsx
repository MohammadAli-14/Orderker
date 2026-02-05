import useSocialAuth from "@/hooks/useSocialAuth";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const AuthScreen = () => {
  const { loadingStrategy, handleSocialAuth } = useSocialAuth();
  const { user, isSignedIn } = useUser();
  const { signOut } = useAuth();

  useEffect(() => {
    if (isSignedIn && user?.publicMetadata?.role === "admin") {
      Alert.alert("Access Denied", "Admins cannot use the mobile app.");
      signOut();
    }
  }, [isSignedIn, user]);

  if (loadingStrategy) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black justify-center items-center px-8">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* BRANDING SECTION - Top */}
      <View className="justify-center items-center w-full mb-8">
        {/* Container for seamless blending */}
        <View className="items-center justify-center p-4">
          <Image
            source={require("../../assets/images/auth-image.png")}
            className="w-80 h-80"
            resizeMode="contain"
          />
        </View>
        <Text className="text-gray-400 text-base mt-2 font-medium tracking-wide">
          Your daily groceries, delivered.
        </Text>
      </View>

      {/* ACTION SECTION - Bottom */}
      <View className="w-full gap-5 mb-10">
        {/* GOOGLE SIGN IN BTN */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-[#1A1A1A] border border-[#333] rounded-full py-4 px-6 active:opacity-90"
          onPress={() => handleSocialAuth("oauth_google")}
          disabled={loadingStrategy !== null}
        >
          {loadingStrategy === "oauth_google" ? (
            <ActivityIndicator size={"small"} color={"#fff"} />
          ) : (
            <View className="flex-row items-center justify-center">
              <Image
                source={require("../../assets/images/google.png")}
                className="w-5 h-5 mr-3"
                resizeMode="contain"
              />
              <Text className="text-white font-bold text-lg">Continue with Google</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* APPLE SIGN IN BTN */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-[#1A1A1A] border border-[#333] rounded-full py-4 px-6 active:opacity-90"
          onPress={() => handleSocialAuth("oauth_apple")}
          disabled={loadingStrategy !== null}
        >
          {loadingStrategy === "oauth_apple" ? (
            <ActivityIndicator size={"small"} color={"#fff"} />
          ) : (
            <View className="flex-row items-center justify-center">
              <Image
                source={require("../../assets/images/apple.png")}
                className="w-5 h-5 mr-3"
                resizeMode="contain"
                style={{ tintColor: "#fff" }}
              />
              <Text className="text-white font-bold text-lg">Continue with Apple</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* TERMS FOOTER */}
        <Text className="text-center text-gray-500 text-xs leading-5 mt-4">
          By signing up, you agree to our{" "}
          <Text className="text-primary font-bold">Terms</Text>,{" "}
          <Text className="text-primary font-bold">Privacy Policy</Text>, and{" "}
          <Text className="text-primary font-bold">Cookie Use</Text>.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default AuthScreen;
