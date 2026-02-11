import SafeScreen from "@/components/SafeScreen";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import useProducts from "@/hooks/useProducts";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import { ProductCard } from "@/components/ProductCard";
import AsyncStorage from "@react-native-async-storage/async-storage";

const POPULAR_CATEGORIES = [
    { id: "dairy", name: "Dairy", icon: "water-outline" },
    { id: "snacks", name: "Snacks", icon: "fast-food-outline" },
    { id: "beverages", name: "Beverages", icon: "wine-outline" },
    { id: "personal care", name: "Personal Care", icon: "medkit-outline" },
];

const RECENT_SEARCHES_KEY = "recent_searches";

export default function SearchScreen() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    const { data: products = [], isLoading } = useProducts();
    const { addToCart, isAddingToCart } = useCart();
    const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlist();

    // Load recent searches on focus
    const loadRecentSearches = useCallback(async () => {
        try {
            const saved = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
            if (saved) {
                setRecentSearches(JSON.parse(saved));
            } else {
                setRecentSearches(["Milk", "Lassi", "Eggs", "Chips"]); // Defaults
            }
        } catch (error) {
            console.error("Error loading recent searches:", error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadRecentSearches();
        }, [loadRecentSearches])
    );

    const saveRecentSearches = async (searches: string[]) => {
        try {
            await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
        } catch (error) {
            console.error("Error saving recent searches:", error);
        }
    };

    async function handleRemoveRecent(term: string) {
        const updated = recentSearches.filter(s => s !== term);
        setRecentSearches(updated);
        await saveRecentSearches(updated);
    }

    async function handleClearAll() {
        setRecentSearches([]);
        await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    }

    const filteredProducts = useMemo(() => {
        if (!searchText.trim()) return [];
        return products.filter(p =>
            p.name.toLowerCase().includes(searchText.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [products, searchText]);

    const trendingProducts = useMemo(() => {
        return [...products]
            .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
            .slice(0, 4);
    }, [products]);

    function handleAddToCart(product: any) {
        addToCart(
            { productId: product._id, quantity: 1 },
            {
                onSuccess: () => Alert.alert("Success", `${product.name} added to cart!`),
                onError: (error: any) => {
                    Alert.alert("Error", error?.response?.data?.message || "Failed to add to cart");
                },
            }
        );
    }

    function handleCategoryPress(category: string) {
        router.push(`/(tabs)/home?category=${category.toLowerCase()}`);
    }

    return (
        <SafeScreen>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false} className="bg-white">
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center border-b border-gray-100 mb-2">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center -ml-2 mr-2"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-text-primary">Discovery</Text>
                </View>

                {/* Search Input */}
                <View className="px-6 py-4">
                    <View className="flex-row items-center bg-purple-50 rounded-2xl px-4 py-3.5">
                        <Ionicons name="search" size={20} color="#5E2D87" />
                        <TextInput
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder="Search for groceries..."
                            className="flex-1 ml-3 text-base text-gray-800"
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity className="bg-primary p-2 rounded-xl ml-2 shadow-sm">
                            <Ionicons name="options-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                {searchText.trim() ? (
                    <View className="px-6 mt-4">
                        <Text className="text-lg font-bold text-text-primary mb-4">Results</Text>
                        <View className="flex-row flex-wrap justify-between">
                            {filteredProducts.map((item) => (
                                <View key={item._id} className="w-[48%] mb-4">
                                    <ProductCard
                                        title={item.name}
                                        price={item.price}
                                        rating={item.averageRating}
                                        reviews={item.totalReviews}
                                        image={item.images?.[0] || "https://via.placeholder.com/150"}
                                        isLiked={isInWishlist(item._id)}
                                        onWishlistToggle={() => toggleWishlist(item._id)}
                                        isWishlistLoading={isAddingToWishlist || isRemovingFromWishlist}
                                        onAdd={() => handleAddToCart(item)}
                                        isAddingToCart={isAddingToCart}
                                        onPress={() => router.push(`/product/${item._id}`)}
                                    />
                                </View>
                            ))}
                            {filteredProducts.length === 0 && (
                                <View className="w-full items-center py-10">
                                    <Text className="text-gray-400">No products found matching "{searchText}"</Text>
                                </View>
                            )}
                        </View>
                    </View>
                ) : (
                    <>
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                            <View className="px-6 mt-2">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-lg font-bold text-text-primary">Recent Searches</Text>
                                    <TouchableOpacity onPress={handleClearAll}>
                                        <Text className="text-primary font-semibold text-sm">Clear All</Text>
                                    </TouchableOpacity>
                                </View>
                                <View className="space-y-1">
                                    {recentSearches.map((term) => (
                                        <View key={term} className="flex-row items-center justify-between py-3 border-b border-gray-50">
                                            <TouchableOpacity
                                                className="flex-row items-center flex-1"
                                                onPress={() => setSearchText(term)}
                                            >
                                                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
                                                    <Ionicons name="time-outline" size={20} color="#9CA3AF" />
                                                </View>
                                                <Text className="text-gray-700 font-medium">{term}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleRemoveRecent(term)} className="p-2 rounded-full">
                                                <Ionicons name="close" size={20} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Popular Categories */}
                        <View className="px-6 mt-8">
                            <Text className="text-lg font-bold text-text-primary mb-5">Popular Categories</Text>
                            <View className="flex-row flex-wrap justify-between">
                                {POPULAR_CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => handleCategoryPress(cat.name)}
                                        className="w-[48%] bg-gray-50 rounded-3xl p-6 items-center justify-center mb-4 border border-gray-100"
                                        activeOpacity={0.7}
                                    >
                                        <View className="w-16 h-16 rounded-full bg-white shadow-sm items-center justify-center mb-4">
                                            <Ionicons name={cat.icon as any} size={28} color="#5E2D87" />
                                        </View>
                                        <Text className="font-semibold text-text-primary">{cat.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Trending Products */}
                        {trendingProducts.length > 0 && (
                            <View className="px-6 mt-8">
                                <Text className="text-lg font-bold text-text-primary mb-5">Trending Items</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                                    {trendingProducts.map((item) => (
                                        <View key={item._id} className="mr-4 w-40">
                                            <ProductCard
                                                title={item.name}
                                                price={item.price}
                                                rating={item.averageRating}
                                                reviews={item.totalReviews}
                                                image={item.images?.[0] || "https://via.placeholder.com/150"}
                                                isLiked={isInWishlist(item._id)}
                                                onWishlistToggle={() => toggleWishlist(item._id)}
                                                isWishlistLoading={isAddingToWishlist || isRemovingFromWishlist}
                                                onAdd={() => handleAddToCart(item)}
                                                isAddingToCart={isAddingToCart}
                                                onPress={() => router.push(`/product/${item._id}`)}
                                            />
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </>
                )}

            </ScrollView>
        </SafeScreen>
    );
}
