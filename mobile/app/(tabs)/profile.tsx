import SafeScreen from "@/components/SafeScreen";
import { useAuth, useUser } from "@clerk/clerk-expo";

import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const MENU_ITEMS = [
  { id: 1, icon: "bag-outline", title: "Orders", color: "#10B981", action: "/orders" },
  { id: 2, icon: "map-outline", title: "Addresses", color: "#F59E0B", action: "/addresses" },
  { id: 3, icon: "heart-outline", title: "Wishlist", color: "#EF4444", action: "/wishlist" },
] as const;

const ProfileScreen = () => {
  const { signOut } = useAuth();
  const { user } = useUser();

  const handleMenuPress = (action: (typeof MENU_ITEMS)[number]["action"]) => {
    router.push(action);
  };

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
      >
        {/* HEADER */}
        <View className="px-6 pb-6">
          <View className="bg-surface rounded-3xl p-6">
            <View className="flex-row items-center">
              <View className="relative">
                <View
                  style={{
                    shadowColor: "#1DB954",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  <Image
                    source={user?.imageUrl}
                    style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: "#1DB954" }}
                    transition={200}
                  />
                </View>
                <View className="absolute -bottom-1 -right-1 bg-primary rounded-full size-7 items-center justify-center border-2 border-surface">
                  <Ionicons name="checkmark" size={16} color="#121212" />
                </View>
              </View>

              <View className="flex-1 ml-4">
                <Text className="text-text-primary text-2xl font-bold mb-1">
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text className="text-text-secondary text-sm mb-2">
                  {user?.emailAddresses?.[0]?.emailAddress || "No email"}
                </Text>
                <View className="bg-primary/20 self-start px-3 py-1 rounded-full">
                  <Text className="text-primary text-xs font-semibold">Verified Member</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* MENU ITEMS */}
        <View className="flex-row flex-wrap justify-between mx-6 mb-4">
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-surface rounded-2xl p-5 items-center justify-center mb-3"
              style={{
                width: "31%",
                shadowColor: item.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item.action)}
            >
              <View
                className="rounded-2xl w-14 h-14 items-center justify-center mb-3"
                style={{ backgroundColor: item.color + "20" }}
              >
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <Text className="text-text-primary font-semibold text-sm text-center">{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PRIVACY AND SECURITY LINK */}
        <TouchableOpacity
          className="mx-6 mb-4 bg-surface rounded-2xl p-4"
          activeOpacity={0.7}
          onPress={() => router.push("/privacy-security")}
          style={{
            shadowColor: "#1DB954",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-primary/20 rounded-xl w-11 h-11 items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={22} color="#1DB954" />
              </View>
              <View>
                <Text className="text-text-primary font-bold text-base">Privacy & Security</Text>
                <Text className="text-text-secondary text-xs mt-0.5">Manage your account settings</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
        </TouchableOpacity>

        {/* SIGNOUT BTN */}
        <TouchableOpacity
          className="mx-6 mb-4 bg-surface rounded-2xl py-5 flex-row items-center justify-center border border-red-500/30"
          activeOpacity={0.8}
          onPress={() => signOut()}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text className="text-red-500 font-bold text-base ml-2">Sign Out</Text>
        </TouchableOpacity>

        {/* VERSION INFO */}
        <View className="mx-6 items-center">
          <Text className="text-text-tertiary text-xs">OrderKer v1.0.0</Text>
          <Text className="text-text-tertiary text-xs mt-1">Made with ❤️ in Karachi</Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default ProfileScreen;

// REACT NATIVE IMAGE VS EXPO IMAGE:

// React Native Image (what we have used so far):
// import { Image } from "react-native";
//
// <Image source={{ uri: url }} />

// Basic image component
// No built-in caching optimization
// Requires source={{ uri: string }}

// Expo Image (from expo-image):
// import { Image } from "expo-image";

// <Image source={url} />

// Caching - automatic disk/memory caching
// Placeholder - blur hash, thumbnail while loading
// Transitions - crossfade, fade animations
// Better performance - optimized native rendering
// Simpler syntax: source={url} or source={{ uri: url }}
// Supports contentFit instead of resizeMode

// Example with expo-image:
// <Image   source={user?.imageUrl}  placeholder={blurhash}  transition={200}  contentFit="cover"  className="size-20 rounded-full"/>

// Recommendation: For production apps, expo-image is better — faster, cached, smoother UX.
// React Native's Image works fine for simple cases though.
