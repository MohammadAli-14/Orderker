import SafeScreen from "@/components/SafeScreen";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, FlatList, Image as RNImage } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import useProducts from "@/hooks/useProducts";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "@/context/ToastContext";
import { Image } from "expo-image";

// Define all categories with their icons/images
const ALL_CATEGORIES = [
    { id: "dairy", name: "Dairy & Eggs", image: require("@/assets/images/Milkpak.jpg") },
    { id: "snacks", name: "Snacks", image: require("@/assets/categories/snacks.png") },
    { id: "beverages", name: "Beverages", image: require("@/assets/categories/beverages.png") },
    { id: "staples", name: "Staples", image: require("@/assets/images/Dalda.jpg") },
    { id: "fruits", name: "Fruits", image: require("@/assets/categories/fruits.png") },
    { id: "vegetables", name: "Vegetables", image: require("@/assets/categories/vegetables.png") },
    { id: "personal care", name: "Personal Care", image: require("@/assets/categories/hygiene.png") },
    { id: "household", name: "Household", image: require("@/assets/categories/household.png") },
];

const RECENT_SEARCHES_KEY = "recent_searches";

export default function SearchScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [searchText, setSearchText] = useState("");
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const { data: products = [], isLoading } = useProducts();
    const { addToCart, isAddingToCart } = useCart();
    const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlist();
    const { showToast } = useToast();

    // Handle initial category from params
    useEffect(() => {
        if (params.category) {
            const cat = Array.isArray(params.category) ? params.category[0] : params.category;
            setSelectedCategory(cat);
            // Don't modify search text, let category filter handle it
        }
    }, [params.category]);

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
            // Clear params if navigating back
            return () => {
                // setSelectedCategory(null); // Optional: reset on blur
            };
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
        if (!searchText.trim() && !selectedCategory) return [];

        const query = searchText.toLowerCase().trim();
        const categoryFilter = selectedCategory ? selectedCategory.toLowerCase() : "";

        return products.filter(p => {
            let matches = true;
            if (query) {
                matches = p.name.toLowerCase().includes(query) || (p.category ? p.category.toLowerCase().includes(query) : false);
            }
            if (matches && categoryFilter) {
                // Loose match for category
                matches = p.category ? p.category.toLowerCase().includes(categoryFilter) : false;
            }
            return matches;
        });
    }, [products, searchText, selectedCategory]);

    const trendingProducts = useMemo(() => {
        return [...products]
            .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
            .slice(0, 6);
    }, [products]);

    const handleAddToCart = useCallback((product: any) => {
        addToCart(
            { productId: product._id, quantity: 1 },
            {
                onSuccess: () => showToast({
                    title: "Success",
                    message: `${product.name} added to cart!`,
                    type: "success"
                }),
                onError: (error: any) => {
                    showToast({
                        title: "Error",
                        message: error?.response?.data?.message || "Failed to add to cart",
                        type: "error"
                    });
                },
            }
        );
    }, [addToCart, showToast]);

    const handleCategoryPress = useCallback((item: typeof ALL_CATEGORIES[0]) => {
        setSelectedCategory(item.id);
        setSearchText(""); // Clear search to focus on category
    }, []);

    const handleProductPress = useCallback((id: string) => {
        router.push(`/product/${id}` as any);
    }, [router]);

    const handleToggleWishlist = useCallback((id: string) => {
        toggleWishlist(id);
    }, [toggleWishlist]);

    const renderItem = useCallback(({ item }: { item: Product }) => (
        <View className="w-[31.5%] mb-3">
            <ProductCard
                title={item.name}
                price={item.price}
                rating={item.averageRating}
                reviews={item.totalReviews}
                image={item.images?.[0] || "https://via.placeholder.com/150"}
                isLiked={isInWishlist(item._id)}
                onWishlistToggle={() => handleToggleWishlist(item._id)}
                isWishlistLoading={isAddingToWishlist || isRemovingFromWishlist}
                onAdd={() => handleAddToCart(item)}
                isAddingToCart={isAddingToCart}
                onPress={() => handleProductPress(item._id)}
                isFlashSale={item.isFlashSale}
                discountPercent={item.discountPercent}
                compact={true}
            />
        </View>
    ), [isInWishlist, handleToggleWishlist, isAddingToWishlist, isRemovingFromWishlist, handleAddToCart, isAddingToCart, handleProductPress]);

    const ListHeader = useMemo(() => (
        <View>
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
                        onChangeText={(text) => {
                            setSearchText(text);
                            if (text) setSelectedCategory(null); // Clear category if typing
                        }}
                        placeholder="Search for groceries..."
                        className="flex-1 ml-3 text-base text-gray-800"
                        placeholderTextColor="#9CA3AF"
                        autoFocus={!params.category}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText("")}>
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {(!searchText.trim() && !selectedCategory) ? (
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

                    {/* All Categories Grid */}
                    <View className="px-6 mt-8">
                        <Text className="text-lg font-bold text-text-primary mb-5">Browse Categories</Text>
                        <View className="flex-row flex-wrap justify-between">
                            {ALL_CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    onPress={() => handleCategoryPress(cat)}
                                    className="w-[23%] mb-6 items-center"
                                    activeOpacity={0.7}
                                >
                                    <View className="w-16 h-16 rounded-3xl bg-gray-50 items-center justify-center mb-2 border border-gray-100 shadow-sm overflow-hidden">
                                        {cat.image ? (
                                            <Image
                                                source={cat.image}
                                                style={{ width: "100%", height: "100%" }}
                                                contentFit="cover"
                                            />
                                        ) : (
                                            <Ionicons name="grid-outline" size={28} color="#5E2D87" />
                                        )}
                                    </View>
                                    <Text className="font-medium text-text-primary text-xs text-center" numberOfLines={2}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Trending Products */}
                    {trendingProducts.length > 0 && (
                        <View className="px-6 mt-4">
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
                                            onWishlistToggle={() => handleToggleWishlist(item._id)}
                                            isWishlistLoading={isAddingToWishlist || isRemovingFromWishlist}
                                            onAdd={() => handleAddToCart(item)}
                                            isAddingToCart={isAddingToCart}
                                            onPress={() => handleProductPress(item._id)}
                                            isFlashSale={item.isFlashSale}
                                            discountPercent={item.discountPercent}
                                        />
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </>
            ) : (
                <View className="px-6 mt-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-text-primary">
                            {selectedCategory ? `Category: ${ALL_CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory}` : "Search Results"}
                        </Text>
                        {selectedCategory && (
                            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                                <Text className="text-primary text-sm font-medium">Clear Filter</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {filteredProducts.length === 0 && (
                        <View className="w-full items-center py-10">
                            <Text className="text-gray-400">No products found matching your criteria</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    ), [searchText, recentSearches, trendingProducts, filteredProducts, router, handleCategoryPress, handleProductPress, handleAddToCart, handleToggleWishlist, isInWishlist, isAddingToWishlist, isRemovingFromWishlist, isAddingToCart, params, selectedCategory]);

    return (
        <SafeScreen>
            <View className="flex-1 bg-white">
                <FlatList
                    data={(searchText.trim() || selectedCategory) ? filteredProducts : []}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    numColumns={3}
                    ListHeaderComponent={ListHeader}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    columnWrapperStyle={(searchText.trim() || selectedCategory) ? { paddingHorizontal: 16, justifyContent: 'flex-start', gap: 10 } : undefined}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={9}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                />
            </View>
        </SafeScreen>
    );
}
