import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { calculateFinalPrice } from "@/lib/utils";

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
    isFlashSale?: boolean;
    discountPercent?: number;
    compact?: boolean;
}

export const ProductCard = React.memo(({
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
    isWishlistLoading,
    isFlashSale,
    discountPercent,
    compact
}: ProductCardProps) => {
    const salePrice = calculateFinalPrice(price, isFlashSale, discountPercent || 0);
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityLabel={`${title}, Price: PKR ${price}`}
            accessibilityRole="link"
            accessibilityHint="Navigates to product details"
            className={`bg-white shadow-sm overflow-hidden relative ${compact ? 'rounded-2xl p-1.5 border border-gray-50' : 'rounded-3xl p-3 border border-gray-100'}`}
        >
            {/* Flash Sale Badge */}
            {isFlashSale && (
                <View className={`absolute z-10 bg-accent-red rounded-lg ${compact ? 'top-1.5 left-1.5 px-1 py-0.5' : 'top-3 left-3 px-2 py-1'}`}>
                    <Text className={`text-white font-black italic ${compact ? 'text-[6px]' : 'text-[8px]'}`}>⚡ FLASH</Text>
                </View>
            )}
            {/* Wishlist Button */}
            <View className={`absolute z-10 ${compact ? 'top-1.5 right-1.5' : 'top-3 right-3'}`}>
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        onWishlistToggle?.();
                    }}
                    disabled={isWishlistLoading}
                    accessibilityLabel={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isLiked, disabled: isWishlistLoading }}
                    className={`bg-white/90 rounded-full items-center justify-center shadow-sm ${compact ? 'w-6 h-6 p-1' : 'w-9 h-9 p-2'}`}
                >
                    {isWishlistLoading ? (
                        <ActivityIndicator size="small" color="#5E2D87" />
                    ) : (
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={compact ? 12 : 18}
                            color={isLiked ? "#EF4444" : "#9CA3AF"}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {/* Product Image Area */}
            <View className={`w-full aspect-square bg-gray-50/50 overflow-hidden ${compact ? 'rounded-xl mb-1.5' : 'rounded-2xl mb-3'}`}>
                <Image
                    source={{ uri: image }}
                    contentFit="cover"
                    transition={300}
                    style={{ width: '100%', height: '100%' }}
                    placeholder="https://via.placeholder.com/150"
                />
            </View>

            {/* Product Info */}
            <View className={compact ? "space-y-0" : "space-y-0.5"}>
                <Text
                    numberOfLines={1}
                    className={`font-semibold text-gray-800 leading-tight ${compact ? 'text-[10px]' : 'text-xs'}`}
                >
                    {title}
                </Text>

                {rating !== undefined && (
                    <View className="flex-row items-center">
                        <Ionicons name="star" size={compact ? 8 : 10} color="#F59E0B" />
                        <Text className={`text-gray-500 ml-1 font-medium ${compact ? 'text-[7px]' : 'text-[9px]'}`}>
                            {rating} <Text className="text-gray-400">({reviews})</Text>
                        </Text>
                    </View>
                )}

                <View className={`flex-row items-center justify-between ${compact ? 'pt-0' : 'pt-0.5'}`}>
                    <View>
                        <Text className={`text-gray-400 font-medium leading-none ${compact ? 'text-[6px]' : 'text-[8px]'}`}>PKR</Text>
                        <View className="flex-row items-baseline gap-1">
                            <Text className={`font-bold text-primary leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>
                                {salePrice}
                            </Text>
                            {isFlashSale && (
                                <Text className={`text-gray-400 line-through ${compact ? 'text-[6px]' : 'text-[8px]'}`}>
                                    {price}
                                </Text>
                            )}
                        </View>
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
                        className={`bg-primary rounded-lg shadow-sm ${compact ? 'p-1' : 'p-1.5'}`}
                        style={{ elevation: 2 }}
                    >
                        {isAddingToCart ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Ionicons name="add" size={compact ? 14 : 20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
});
