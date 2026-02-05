import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

function PrivacyAndSecurityScreen() {
  return (
    <SafeScreen>
      {/* HEADER */}
      <View className="px-6 pb-5 border-b border-surface flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text className="text-text-primary text-2xl font-bold">Privacy & Security</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
      >
        {/* YOUR PRIVACY MATTERS SECTION */}
        <View className="px-6 pt-6">
          <Text className="text-text-primary text-lg font-bold mb-4">Your Privacy Matters</Text>

          {/* Trust Badges */}
          <View className="flex-row flex-wrap justify-between mb-4">
            <View className="bg-surface rounded-2xl p-4 items-center" style={{ width: "48%" }}>
              <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mb-2">
                <Ionicons name="lock-closed" size={24} color="#1DB954" />
              </View>
              <Text className="text-text-primary font-bold text-sm text-center">256-bit AES</Text>
              <Text className="text-text-secondary text-xs text-center">Encryption</Text>
            </View>
            <View className="bg-surface rounded-2xl p-4 items-center" style={{ width: "48%" }}>
              <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mb-2">
                <Ionicons name="shield-checkmark" size={24} color="#1DB954" />
              </View>
              <Text className="text-text-primary font-bold text-sm text-center">GDPR</Text>
              <Text className="text-text-secondary text-xs text-center">Compliant</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between mb-4">
            <View className="bg-surface rounded-2xl p-4 items-center" style={{ width: "48%" }}>
              <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mb-2">
                <Ionicons name="eye-off" size={24} color="#1DB954" />
              </View>
              <Text className="text-text-primary font-bold text-sm text-center">No Tracking</Text>
              <Text className="text-text-secondary text-xs text-center">Third-Party Free</Text>
            </View>
            <View className="bg-surface rounded-2xl p-4 items-center" style={{ width: "48%" }}>
              <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mb-2">
                <Ionicons name="close-circle" size={24} color="#1DB954" />
              </View>
              <Text className="text-text-primary font-bold text-sm text-center">Never Sold</Text>
              <Text className="text-text-secondary text-xs text-center">Your Data is Yours</Text>
            </View>
          </View>

          {/* Detailed Privacy Message */}
          <View className="bg-surface rounded-2xl p-5 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="heart" size={20} color="#1DB954" />
              <Text className="text-text-primary font-bold text-base ml-2">Our Commitment to You</Text>
            </View>
            <Text className="text-text-secondary text-sm leading-5 mb-3">
              At OrderKer, your privacy is our top priority. We believe you have the right to know exactly how your data is used.
            </Text>
            <View className="space-y-2">
              <View className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={16} color="#1DB954" style={{ marginTop: 2 }} />
                <Text className="text-text-secondary text-sm ml-2 flex-1">
                  Your personal information is encrypted and stored on secure servers
                </Text>
              </View>
              <View className="flex-row items-start mt-2">
                <Ionicons name="checkmark-circle" size={16} color="#1DB954" style={{ marginTop: 2 }} />
                <Text className="text-text-secondary text-sm ml-2 flex-1">
                  We never sell, rent, or share your data with third parties for advertising
                </Text>
              </View>
              <View className="flex-row items-start mt-2">
                <Ionicons name="checkmark-circle" size={16} color="#1DB954" style={{ marginTop: 2 }} />
                <Text className="text-text-secondary text-sm ml-2 flex-1">
                  You can download or delete your data anytime from your profile
                </Text>
              </View>
              <View className="flex-row items-start mt-2">
                <Ionicons name="checkmark-circle" size={16} color="#1DB954" style={{ marginTop: 2 }} />
                <Text className="text-text-secondary text-sm ml-2 flex-1">
                  Payment info is processed by Stripe - we never store your card details
                </Text>
              </View>
            </View>
          </View>

          {/* Contact for Privacy */}
          <View className="bg-primary/10 rounded-2xl p-4 flex-row items-center mb-6">
            <View className="bg-primary/20 rounded-full w-10 h-10 items-center justify-center mr-3">
              <Ionicons name="mail" size={20} color="#1DB954" />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-semibold text-sm">Questions about your privacy?</Text>
              <Text className="text-text-secondary text-xs">Contact us at privacy@orderker.pk</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

export default PrivacyAndSecurityScreen;
