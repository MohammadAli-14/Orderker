import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

interface ProductCardProps {
    title: string;
    price: number;
    image: string;
    rating?: number;
    reviews?: number;
    isLiked?: boolean;
    onWishlistToggle?: () => void;
    onAdd: () => void;
    onPress: () => void;
    isAddingToCart?: boolean;
    isWishlistLoading?: boolean;
}

export const ProductCard = ({
    title,
    price,
    image,
    rating,
    reviews,
    isLiked,
    onWishlistToggle,
    onAdd,
    onPress,
    isAddingToCart,
    isWishlistLoading
}: ProductCardProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityLabel={`${title}, Price: PKR ${price}`}
            accessibilityRole="link"
            accessibilityHint="Navigates to product details"
            className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm overflow-hidden"
        >
            {/* Wishlist Button */}
            <View className="absolute top-3 right-3 z-10">
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        onWishlistToggle?.();
                    }}
                    disabled={isWishlistLoading}
                    accessibilityLabel={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isLiked, disabled: isWishlistLoading }}
                    className="bg-white/90 p-2 rounded-full w-9 h-9 items-center justify-center shadow-sm"
                >
                    {isWishlistLoading ? (
                        <ActivityIndicator size="small" color="#5E2D87" />
                    ) : (
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={18}
                            color={isLiked ? "#EF4444" : "#9CA3AF"}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {/* Product Image Area */}
            <View className="w-full aspect-square bg-gray-50/50 rounded-2xl overflow-hidden mb-3">
                <Image
                    source={{ uri: image }}
                    contentFit="cover"
                    transition={300}
                    style={{ width: '100%', height: '100%' }}
                    placeholder="https://via.placeholder.com/150"
                />
            </View>

            {/* Product Info */}
            <View className="space-y-1">
                <Text
                    numberOfLines={1}
                    className="text-sm font-semibold text-gray-800 leading-5"
                >
                    {title}
                </Text>

                {rating !== undefined && (
                    <View className="flex-row items-center">
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text className="text-[11px] text-gray-500 ml-1 font-medium">
                            {rating} <Text className="text-gray-400">({reviews})</Text>
                        </Text>
                    </View>
                )}

                <View className="flex-row items-center justify-between pt-1">
                    <View>
                        <Text className="text-[10px] text-gray-400 font-medium">PKR</Text>
                        <Text className="text-base font-bold text-primary">
                            {price}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            onAdd();
                        }}
                        disabled={isAddingToCart}
                        accessibilityLabel={`Add ${title} to cart`}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: isAddingToCart }}
                        className="bg-primary p-2 rounded-xl shadow-sm"
                        style={{ elevation: 2 }}
                    >
                        {isAddingToCart ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Ionicons name="add" size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};
