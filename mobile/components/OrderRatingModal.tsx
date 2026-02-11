import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Order } from "@/types";
import { useReviews } from "@/hooks/useReviews";
import SafeScreen from "./SafeScreen";

interface OrderRatingModalProps {
    visible: boolean;
    onClose: () => void;
    order: Order | null;
}

export default function OrderRatingModal({ visible, onClose, order }: OrderRatingModalProps) {
    const { createReviewAsync, isCreatingReview } = useReviews();
    const [ratings, setRatings] = useState<{ [productId: string]: number }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!order) return null;

    const handleSetRating = (productId: string, rating: number) => {
        setRatings((prev) => ({ ...prev, [productId]: rating }));
    };

    const handleSubmit = async () => {
        const productsToRate = order.orderItems.filter((item) => ratings[item.product._id]);

        if (productsToRate.length === 0) {
            Alert.alert("Error", "Please rate at least one product before submitting.");
            return;
        }

        setIsSubmitting(true);
        try {
            for (const item of productsToRate) {
                await createReviewAsync({
                    productId: item.product._id,
                    orderId: order._id,
                    rating: ratings[item.product._id],
                });
            }
            Alert.alert("Success", "Thank you for your feedback!");
            onClose();
        } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.error || "Failed to submit reviews.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeScreen>
                {/* HEADER */}
                <View className="px-6 py-5 border-b border-gray-100 flex-row items-center justify-between bg-white">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={onClose} className="mr-4">
                            <Ionicons name="arrow-back" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <Text className="text-text-primary text-xl font-bold">Rate Products</Text>
                    </View>
                </View>

                <ScrollView className="flex-1 bg-white p-6" showsVerticalScrollIndicator={false}>
                    <Text className="text-text-secondary mb-6 leading-5">
                        How was your experience with these products? Your feedback helps us improve!
                    </Text>

                    {order.orderItems.map((item) => (
                        <View key={item._id} className="mb-8 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                            <View className="flex-row items-center mb-4">
                                <Image
                                    source={{ uri: item.image }}
                                    className="w-16 h-16 rounded-2xl"
                                    contentFit="cover"
                                />
                                <View className="flex-1 ml-4">
                                    <Text className="text-text-primary font-bold text-base" numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                    <Text className="text-text-secondary text-xs mt-1">
                                        Sold by Orderker
                                    </Text>
                                </View>
                            </View>

                            {/* STAR RATING */}
                            <View className="flex-row justify-center py-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => handleSetRating(item.product._id, star)}
                                        className="mx-2"
                                    >
                                        <Ionicons
                                            name={star <= (ratings[item.product._id] || 0) ? "star" : "star-outline"}
                                            size={32}
                                            color={star <= (ratings[item.product._id] || 0) ? "#FFD700" : "#D1D5DB"}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text className="text-center text-xs font-medium text-text-tertiary mt-2">
                                {ratings[item.product._id]
                                    ? ["Poor", "Fair", "Good", "Very Good", "Excellent"][ratings[item.product._id] - 1]
                                    : "Tap to rate"}
                            </Text>
                        </View>
                    ))}

                    <View className="h-20" />
                </ScrollView>

                {/* SUBMIT BUTTON */}
                <View className="p-6 border-t border-gray-100 bg-white">
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting || isCreatingReview}
                        className={`py-4 rounded-2xl items-center justify-center ${isSubmitting ? "bg-primary/50" : "bg-primary"
                            }`}
                        activeOpacity={0.8}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Submit Reviews</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeScreen>
        </Modal>
    );
}
