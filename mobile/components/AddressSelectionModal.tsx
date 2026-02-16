import { useAddresses } from "@/hooks/useAddressess";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { PrimaryButton } from "./PrimaryButton";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { useUser } from "@clerk/clerk-expo";
import { useProfile } from "@/hooks/useProfile";

interface AddressSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onProceed: (address: Address) => void;
  isProcessing: boolean;
  allowLive?: boolean;
}

const AddressSelectionModal = ({
  visible,
  onClose,
  onProceed,
  isProcessing,
  allowLive = true,
}: AddressSelectionModalProps) => {
  const { user } = useUser();
  const { profile } = useProfile();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [liveLocationAddress, setLiveLocationAddress] = useState<Address | null>(null);
  const [extraDetails, setExtraDetails] = useState("");

  const { addresses, isLoading: addressesLoading } = useAddresses();
  const { detectLocation, loading: detectingLocation } = useLocationDetection();

  const handleProceed = () => {
    if (selectedAddress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const finalAddress = { ...selectedAddress };
      if (selectedAddress._id === "live-location" && extraDetails) {
        finalAddress.streetAddress = `${extraDetails.trim()}, ${selectedAddress.streetAddress}`;
      }

      onProceed(finalAddress);
    }
  };

  const handleDetectLocation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const detected = await detectLocation();
    if (detected) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const virtualAddress: Address = {
        _id: "live-location",
        label: "Live Location",
        fullName: user?.fullName || profile?.name || "Valued Customer",
        streetAddress: detected.address || detected.area,
        city: detected.city || detected.zone,
        state: detected.zone || detected.city || "Karachi",
        zipCode: "Live",
        phoneNumber: user?.primaryPhoneNumber?.phoneNumber || profile?.phoneNumber || "",
        isDefault: false
      };
      setLiveLocationAddress(virtualAddress);
      setSelectedAddress(virtualAddress);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-2/3">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
            <Text className="text-text-primary text-2xl font-bold">Select Address</Text>
            <TouchableOpacity onPress={onClose} className="bg-gray-100 rounded-full p-2">
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* ADDRESSES LIST */}
          <ScrollView className="flex-1 px-6 pt-4">
            {addressesLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#5D3EBC" />
              </View>
            ) : (
              <View className="gap-4 pb-8">
                {/* DETECT LIVE LOCATION OPTION */}
                {allowLive && (
                  <TouchableOpacity
                    onPress={handleDetectLocation}
                    disabled={detectingLocation}
                    className="p-4 rounded-2xl border border-dashed border-green-500 bg-green-50 flex-row items-center mb-2"
                    activeOpacity={0.7}
                  >
                    <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mr-3">
                      {detectingLocation ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Ionicons name="navigate" size={20} color="white" />
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="font-bold text-base text-green-600">Deliver to My Current Location</Text>
                        <View className="ml-2 bg-green-500 px-1.5 py-0.5 rounded-md">
                          <Text className="text-white text-[8px] font-black uppercase">Live</Text>
                        </View>
                      </View>
                      <Text className="text-green-700/60 text-xs">Instantly detect your zone for faster delivery</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* ADD NEW ADDRESS OPTION */}
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onClose();
                    router.push("/addresses");
                  }}
                  className="p-4 rounded-2xl border border-dashed border-primary bg-primary/5 flex-row items-center mb-2"
                  activeOpacity={0.7}
                >
                  <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
                    <Ionicons name="add" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-base text-primary">Add New Address</Text>
                    <Text className="text-text-secondary text-xs">Enter a different shipping destination</Text>
                  </View>
                </TouchableOpacity>

                {/* DISPLAY DETECTED LIVE ADDRESS IF ANY */}
                {allowLive && liveLocationAddress && (
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedAddress(liveLocationAddress);
                      }}
                      className={`p-4 rounded-2xl border flex-row items-start ${selectedAddress?._id === "live-location" ? "bg-green-50 border-green-500" : "bg-white border-gray-200"
                        }`}
                      activeOpacity={0.7}
                    >
                      <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${selectedAddress?._id === "live-location" ? "bg-green-500" : "bg-gray-100"}`}>
                        <Ionicons name="navigate" size={20} color={selectedAddress?._id === "live-location" ? "white" : "#6B7280"} />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text className="font-bold text-base text-text-primary mr-2">Detected Location</Text>
                          <View className="bg-green-500 px-1.5 py-0.5 rounded-md">
                            <Text className="text-white text-[8px] font-black uppercase">Live</Text>
                          </View>
                        </View>
                        <Text className="text-text-secondary text-sm">{liveLocationAddress.streetAddress}, {liveLocationAddress.city}</Text>
                        {(!user?.primaryPhoneNumber?.phoneNumber && !profile?.phoneNumber) && (
                          <Text className="text-red-500 text-[10px] mt-1 font-bold">⚠️ Profile phone missing, using placeholder</Text>
                        )}
                      </View>
                      {selectedAddress?._id === "live-location" && (
                        <View className="bg-green-500 rounded-full p-1 ml-2">
                          <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* EXTRA DETAILS INPUT FOR LIVE LOCATION */}
                    {selectedAddress?._id === "live-location" && (
                      <View className="mt-2 p-4 bg-green-50/50 rounded-2xl border border-green-100 animate-in fade-in slide-in-from-top-2">
                        <Text className="text-green-800 text-xs font-bold mb-2 uppercase tracking-wider">Add More Details (Optional)</Text>
                        <TextInput
                          className="bg-white border border-green-200 rounded-xl px-4 py-3 text-sm text-text-primary"
                          placeholder="e.g. House #, Street #, or Landmark"
                          placeholderTextColor="#9CA3AF"
                          value={extraDetails}
                          onChangeText={setExtraDetails}
                        />
                        <Text className="text-green-700/50 text-[10px] mt-2">
                          These details will be added to your detected address to help our rider find you faster.
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {addresses?.map((address: Address) => {
                  const isSelected = selectedAddress?._id === address._id;
                  return (
                    <TouchableOpacity
                      key={address._id}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedAddress(address);
                      }}
                      className={`p-4 rounded-2xl border flex-row items-start ${isSelected ? "bg-primary/5 border-primary" : "bg-white border-gray-200"
                        }`}
                      activeOpacity={0.7}
                    >
                      <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isSelected ? "bg-primary" : "bg-gray-100"}`}>
                        <Ionicons name="location" size={20} color={isSelected ? "white" : "#6B7280"} />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text className="font-bold text-base text-text-primary mr-2">
                            {address.label}
                          </Text>
                          {address.isDefault && (
                            <View className="bg-primary/10 rounded-full px-2 py-0.5">
                              <Text className="text-primary text-[10px] font-bold uppercase">Default</Text>
                            </View>
                          )}
                        </View>

                        <Text className="font-semibold text-text-primary mb-1">{address.fullName}</Text>
                        <Text className="text-text-secondary text-sm mb-1">{address.streetAddress}, {address.city}</Text>
                        <Text className="text-text-secondary text-sm">{address.phoneNumber}</Text>
                      </View>

                      {isSelected && (
                        <View className="bg-primary rounded-full p-1 ml-2">
                          <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>

          <View className="p-6 border-t border-gray-100 pb-10">
            <PrimaryButton
              title={isProcessing ? "Processing..." : "Continue to Payment"}
              onPress={handleProceed}
              disabled={!selectedAddress || isProcessing}
              loading={isProcessing}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddressSelectionModal;
