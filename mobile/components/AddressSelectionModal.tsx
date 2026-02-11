import { useAddresses } from "@/hooks/useAddressess";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { PrimaryButton } from "./PrimaryButton";

interface AddressSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onProceed: (address: Address) => void;
  isProcessing: boolean;
}

const AddressSelectionModal = ({
  visible,
  onClose,
  onProceed,
  isProcessing,
}: AddressSelectionModalProps) => {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const { addresses, isLoading: addressesLoading } = useAddresses();

  const handleProceed = () => {
    if (selectedAddress) {
      onProceed(selectedAddress);
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
                {addresses?.map((address: Address) => {
                  const isSelected = selectedAddress?._id === address._id;
                  return (
                    <TouchableOpacity
                      key={address._id}
                      onPress={() => setSelectedAddress(address)}
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
