import SafeScreen from "@/components/SafeScreen";
import useWishlist from "@/hooks/useWishlist";
import useCart from "@/hooks/useCart";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { Alert, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import GradientButton from "@/components/GradientButton";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";
import { calculateFinalPrice, formatCurrency } from "@/lib/utils";

export default function WishlistScreen() {
    const router = useRouter();
    const { wishlist, isLoading, isError, removeFromWishlist, wishlistCount, isRemovingFromWishlist } = useWishlist();
    const { addToCart, isAddingToCart } = useCart();
    const { showToast } = useToast();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [removeModalVisible, setRemoveModalVisible] = useState(false);
    const [itemToRemove, setItemToRemove] = useState<{ id: string; name: string } | null>(null);

    const handleBrowseProducts = () => {
        setIsRedirecting(true);
        // Small delay to make it feel "active"
        setTimeout(() => {
            router.push("/(tabs)/home");
        }, 800);
    };

    useFocusEffect(
        useCallback(() => {
            setIsRedirecting(false);
        }, [])
    );

    const handleAddToCart = useCallback((productId: string, productName: string) => {
        addToCart(
            { productId, quantity: 1 },
            {
                onSuccess: () => showToast({
                    title: "Success",
                    message: `${productName} added to cart!`,
                    type: "success"
                }),
                onError: (error: any) => {
                    showToast({
                        title: "Error",
                        message: error?.response?.data?.error || "Failed to add to cart",
                        type: "error"
                    });
                },
            }
        );
    }, [addToCart, showToast]);

    const handleRemove = useCallback((productId: string, productName: string) => {
        setItemToRemove({ id: productId, name: productName });
        setRemoveModalVisible(true);
    }, []);

    if (isLoading) {
        return (
            <SafeScreen>
                <View className="flex-1 items-center justify-center bg-white">
                    <ActivityIndicator size="large" color="#5E2D87" />
                </View>
            </SafeScreen>
        );
    }

    const renderItem = useCallback(({ item }: { item: any }) => (
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100">
            <View className="flex-row mb-4">
                {/* Image */}
                <View className="w-24 h-24 bg-surface rounded-2xl items-center justify-center overflow-hidden">
                    <Image
                        source={item.images?.[0] || "https://via.placeholder.com/150"}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                    />
                </View>

                {/* Details */}
                <View className="flex-1 ml-4 justify-between">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                            <Text className="font-bold text-base text-text-primary pr-2" numberOfLines={2}>
                                {item.name}
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <View className={`w-2 h-2 rounded-full ${item.stock > 0 ? "bg-green-500" : "bg-gray-400"} mr-2`} />
                                <Text className={`text-xs font-semibold ${item.stock > 0 ? "text-green-600" : "text-gray-500"}`}>
                                    {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                                </Text>
                            </View>
                            {item.isFlashSale && (
                                <View className="bg-primary px-1.5 py-0.5 rounded-md mt-1 self-start">
                                    <Text className="text-white text-[8px] font-black italic">⚡ FLASH</Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={() => handleRemove(item._id, item.name)}
                            className="bg-primary/5 w-8 h-8 rounded-full items-center justify-center border border-primary/10"
                            disabled={isRemovingFromWishlist}
                        >
                            {isRemovingFromWishlist ? (
                                <ActivityIndicator size="small" color="#5E2D87" />
                            ) : (
                                <Ionicons name="trash-outline" size={16} color="#5E2D87" />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Price */}
                    <View>
                        <View className="flex-row items-center">
                            <Text className="text-xl font-bold text-primary">
                                {formatCurrency(calculateFinalPrice(item.price, item.isFlashSale, item.discountPercent || 0))}
                            </Text>
                            {item.isFlashSale && (item.discountPercent || 0) > 0 && (
                                <View className="bg-primary/10 px-1 rounded ml-2">
                                    <Text className="text-primary text-[10px] font-bold">-{item.discountPercent}%</Text>
                                </View>
                            )}
                        </View>
                        {item.isFlashSale && (item.discountPercent || 0) > 0 && (
                            <Text className="text-text-secondary text-xs line-through">
                                {formatCurrency(item.price)}
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
                onPress={() => handleAddToCart(item._id, item.name)}
                disabled={item.stock === 0 || isAddingToCart}
                className={`w-full py-4 rounded-xl flex-row items-center justify-center active:opacity-70 ${item.stock > 0 ? "bg-primary" : "bg-gray-100"
                    }`}
            >
                {isAddingToCart ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <>
                        <Ionicons name="cart-outline" size={20} color={item.stock > 0 ? "white" : "#9CA3AF"} />
                        <Text className={`font-bold ml-2 ${item.stock > 0 ? "text-white" : "text-gray-400"}`}>
                            Add to Cart
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    ), [handleRemove, isRemovingFromWishlist, handleAddToCart, isAddingToCart]);

    const ListEmpty = useCallback(() => (
        <View className="items-center justify-center py-20 px-6">
            <View className="w-28 h-28 bg-primary/5 rounded-full items-center justify-center mb-8 border border-primary/10">
                <Ionicons name="heart-outline" size={52} color="#5E2D87" />
            </View>
            <Text className="text-2xl font-bold text-text-primary mb-3">Your wishlist is empty</Text>
            <Text className="text-text-secondary text-center px-6 leading-6 text-base">
                Save items that you love so you can find them later and easily add them to your cart.
            </Text>

            <TouchableOpacity
                onPress={handleBrowseProducts}
                disabled={isRedirecting}
                className={`mt-10 px-10 py-4 rounded-full flex-row items-center justify-center shadow-lg shadow-primary/30 ${isRedirecting ? "bg-primary/70" : "bg-primary"
                    }`}
                activeOpacity={0.8}
            >
                {isRedirecting ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        <Text className="text-white font-bold text-lg mr-2">Browse Products</Text>
                        <Ionicons name="compass-outline" size={22} color="white" />
                    </>
                )}
            </TouchableOpacity>
        </View>
    ), [isRedirecting, handleBrowseProducts]);

    return (
        <SafeScreen>
            <View className="flex-1 bg-white">
                {/* Standard Header */}
                <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100 bg-white">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center -ml-2"
                    >
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-text-primary">Wishlist</Text>
                    <View className="bg-primary/10 px-3 py-1 rounded-full">
                        <Text className="text-primary text-xs font-bold">{wishlistCount} items</Text>
                    </View>
                </View>

                <FlatList
                    data={wishlist}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    ListEmptyComponent={ListEmpty}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                />
            </View>

            <ConfirmModal
                visible={removeModalVisible}
                onClose={() => setRemoveModalVisible(false)}
                onConfirm={() => {
                    if (itemToRemove) {
                        removeFromWishlist(itemToRemove.id, {
                            onSuccess: () => {
                                setRemoveModalVisible(false);
                                showToast({
                                    title: "Removed",
                                    message: `${itemToRemove.name} removed from wishlist`,
                                    type: "success"
                                });
                            }
                        });
                    }
                }}
                title="Remove from wishlist"
                message={`Are you sure you want to remove ${itemToRemove?.name}?`}
                confirmLabel="Remove"
                isDestructive={true}
                loading={isRemovingFromWishlist}
            />
        </SafeScreen>
    );
}
