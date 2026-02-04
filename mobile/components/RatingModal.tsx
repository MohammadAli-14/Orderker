import { Order } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
  productRatings: { [key: string]: number };
  onRatingChange: (productId: string, rating: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const RatingModal = ({
  visible,
  onClose,
  order,
  productRatings,
  onRatingChange,
  onSubmit,
  isSubmitting,
}: RatingModalProps) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      {/* backdrop layer */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/70 items-center justify-center px-4">
          <TouchableWithoutFeedback>
            <View className="bg-surface rounded-3xl p-6 w-full max-w-md max-h-[80%]">
              <View className="items-center mb-4">
                <View className="bg-primary/20 rounded-full w-16 h-16 items-center justify-center mb-3">
                  <Ionicons name="star" size={32} color="#1DB954" />
                </View>
                <Text className="text-text-primary text-2xl font-bold mb-1">
                  Rate Your Products
                </Text>
                <Text className="text-text-secondary text-center text-sm">
                  Rate each product from your order
                </Text>
              </View>

              <ScrollView className="mb-4">
                {order?.orderItems
                  .filter((item) => item.product?._id)
                  .map((item, index, filteredItems) => {
                    const productId = item.product._id;
                    const currentRating = productRatings[productId] || 0;

                    return (
                      <View
                        key={item._id}
                        className={`bg-background-lighter rounded-2xl p-4 ${
                          index < filteredItems.length - 1 ? "mb-3" : ""
                        }`}
                      >
                      <View className="flex-row items-center mb-3">
                        <Image
                          source={item.image}
                          style={{ height: 64, width: 64, borderRadius: 8 }}
                        />
                        <View className="flex-1 ml-3">
                          <Text
                            className="text-text-primary font-semibold text-sm"
                            numberOfLines={2}
                          >
                            {item.name}
                          </Text>
                          <Text className="text-text-secondary text-xs mt-1">
                            Qty: {item.quantity} • ₨{item.price}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity
                            key={star}
                            onPress={() => onRatingChange(productId, star)}
                            activeOpacity={0.7}
                            className="mx-1.5"
                          >
                            <Ionicons
                              name={star <= currentRating ? "star" : "star-outline"}
                              size={32}
                              color={star <= currentRating ? "#1DB954" : "#666"}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              <View className="gap-3">
                <TouchableOpacity
                  className="bg-primary rounded-2xl py-4 items-center"
                  activeOpacity={0.8}
                  onPress={onSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#121212" />
                  ) : (
                    <Text className="text-background font-bold text-base">Submit All Ratings</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-surface-lighter rounded-2xl py-4 items-center border border-background-lighter"
                  activeOpacity={0.7}
                  onPress={onClose}
                  disabled={isSubmitting}
                >
                  <Text className="text-text-secondary font-bold text-base">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default RatingModal;
