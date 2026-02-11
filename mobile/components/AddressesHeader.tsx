import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AddressesHeader() {
  return (
    <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 items-center justify-center -ml-2 mr-2"
      >
        <Ionicons name="arrow-back" size={24} color="#1F2937" />
      </TouchableOpacity>
      <Text className="text-xl font-bold text-text-primary">My Addresses</Text>
    </View>
  );
}
