import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert, Animated } from "react-native";
import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { SearchInput } from "../../components/SearchInput";
import { ProductCard } from "../../components/ProductCard";
import { useUser } from "@clerk/clerk-expo";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useMemo, useEffect, useRef } from "react";
import useProducts from "@/hooks/useProducts";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocationSelectionModal } from "../../components/LocationSelectionModal";
import { HeroCarousel } from "../../components/HeroCarousel";
import FlashSaleTimer from "../../components/FlashSaleTimer";
import HomeCategories from "../../components/home/HomeCategories";
import FlashSaleSection from "../../components/home/FlashSaleSection";
import { useConfig } from "@/hooks/useConfig";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { calculateFinalPrice, formatCurrency } from "@/lib/utils";

// Category images mapping
const CATEGORY_IMAGES: Record<string, any> = {
    dairy: require("@/assets/categories/dairy.png"),
    beverages: require("@/assets/categories/beverages.png"),
    food: require("@/assets/categories/food.png"),
    fruits: require("@/assets/categories/fruits.png"),
    vegetables: require("@/assets/categories/vegetables.png"),
    snacks: require("@/assets/categories/snacks.png"),
    hygiene: require("@/assets/categories/hygiene.png"),
    masalay: require("@/assets/categories/masalay.png"),
    household: require("@/assets/categories/household.png"),
    staple: require("@/assets/categories/staple.png"),
    all: require("@/assets/categories/default.png"),
    default: require("@/assets/categories/default.png"),
};

const getCategoryImage = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("dairy") || cat.includes("milk")) return CATEGORY_IMAGES.dairy;
    if (cat.includes("snack") || cat.includes("chips")) return CATEGORY_IMAGES.snacks;
    if (cat.includes("bev") || cat.includes("drink") || cat.includes("juice")) return CATEGORY_IMAGES.beverages;
    if (cat.includes("fruit") || cat.includes("phal")) return CATEGORY_IMAGES.fruits;
    if (cat.includes("veg") || cat.includes("sabzi")) return CATEGORY_IMAGES.vegetables;
    if (cat.includes("food")) return CATEGORY_IMAGES.food;
    if (cat.includes("hygiene") || cat.includes("wash") || cat.includes("clean") || cat.includes("personal")) return CATEGORY_IMAGES.hygiene;
    if (cat.includes("masala") || cat.includes("spice")) return CATEGORY_IMAGES.masalay;
    if (cat.includes("house") || cat.includes("clean")) return CATEGORY_IMAGES.household;
    if (cat.includes("staple") || cat.includes("grain") || cat.includes("atta") || cat.includes("rice")) return CATEGORY_IMAGES.staple;
    return CATEGORY_IMAGES.default;
};

import { Product } from "@/types";

// Fallback mock data if API fails
const MOCK_PRODUCTS: Product[] = [
    {
        _id: "mock1",
        name: "Lassi (Sweet)",
        price: 120,
        category: "dairy",
        images: ["https://via.placeholder.com/150"],
        averageRating: 4.8,
        totalReviews: 128,
        isFlashSale: true,
        discountPercent: 25,
        stock: 15,
        description: "Fresh sweet lassi",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: "mock2",
        name: "Chips (Masala)",
        price: 60,
        category: "snacks",
        images: ["https://via.placeholder.com/150"],
        averageRating: 4.5,
        totalReviews: 86,
        isFlashSale: true,
        discountPercent: 50,
        stock: 8,
        description: "Spicy masala chips",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: "mock3",
        name: "Biscuits (Digestive)",
        price: 80,
        category: "snacks",
        images: ["https://via.placeholder.com/150"],
        averageRating: 4.9,
        totalReviews: 210,
        isFlashSale: true,
        discountPercent: 75,
        stock: 3,
        description: "Healthy digestive biscuits",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: "mock4",
        name: "Hand Wash",
        price: 200,
        category: "personal care",
        images: ["https://via.placeholder.com/150"],
        averageRating: 4.7,
        totalReviews: 150,
        isFlashSale: false,
        discountPercent: 0,
        stock: 20,
        description: "Antibacterial hand wash",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: "mock5",
        name: "Fresh Milk",
        price: 180,
        category: "dairy",
        images: ["https://via.placeholder.com/150"],
        averageRating: 4.6,
        totalReviews: 95,
        isFlashSale: false,
        discountPercent: 0,
        stock: 45,
        description: "Pure fresh cow milk",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: "mock6",
        name: "Orange Juice",
        price: 250,
        category: "beverages",
        images: ["https://via.placeholder.com/150"],
        averageRating: 4.4,
        totalReviews: 72,
        isFlashSale: false,
        discountPercent: 0,
        stock: 30,
        description: "Freshly squeezed orange juice",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
];

export default function HomeScreen() {
    const { user } = useUser();
    const router = useRouter();

    const [searchText, setSearchText] = useState("");
    // Category state is now derived from URL parameters (categoryParam)

    // Location state
    const [userZone, setUserZone] = useState<string | null>(null);
    const [userArea, setUserArea] = useState<string | null>(null);
    const [userCity, setUserCity] = useState<string | null>(null);
    const [isLiveLocation, setIsLiveLocation] = useState(false);
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [isLocationLoaded, setIsLocationLoaded] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);

    // API Hooks
    const { data: apiProducts = [], isLoading, isError } = useProducts();
    const { addToCart, isAddingToCart } = useCart();
    const wishlistProps = useWishlist();
    const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } = wishlistProps;
    const { showToast } = useToast();
    const { data: config } = useConfig();

    const { category: categoryParam } = useLocalSearchParams<{ category: string }>();
    const scrollViewRef = useRef<FlatList>(null);
    const scrollY = useRef(new Animated.Value(0)).current;
    const [popularItemsY, setPopularItemsY] = useState(0);


    // Header interpolations
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -10],
        extrapolate: 'clamp'
    });

    // Adaptive Rendering Effect for Category Switches
    useEffect(() => {
        setIsSwitching(true);
        const timer = setTimeout(() => {
            setIsSwitching(false);
        }, 300); // 300ms skip to allow UI thread to breathe
        return () => clearTimeout(timer);
    }, [categoryParam]);

    useEffect(() => {
        if (categoryParam && scrollViewRef.current && popularItemsY > 0) {
            scrollViewRef.current.scrollToOffset({
                offset: popularItemsY - 20,
                animated: true,
            });
        }
    }, [categoryParam, popularItemsY]);

    // Initial location load
    useFocusEffect(
        useCallback(() => {
            const checkLocation = async () => {
                if (!user?.id) return;
                try {
                    const userId = user.id;
                    const savedZone = await AsyncStorage.getItem(`user_zone_${userId}`);
                    const savedArea = await AsyncStorage.getItem(`user_area_${userId}`);
                    const savedCity = await AsyncStorage.getItem(`user_city_${userId}`);
                    const savedMode = await AsyncStorage.getItem(`location_mode_${userId}`);

                    if (savedZone) setUserZone(savedZone);
                    else setUserZone("Malir");

                    if (savedArea) setUserArea(savedArea);
                    else setUserArea("Malir Cantt");

                    if (savedCity) setUserCity(savedCity || null);
                    if (savedMode === "auto") setIsLiveLocation(true);
                    else setIsLiveLocation(false);

                    setIsLocationLoaded(true);

                    if (!savedZone || !savedArea) {
                        setTimeout(() => setLocationModalVisible(true), 1500);
                    }
                } catch (error) {
                    setIsLocationLoaded(true);
                }
            };
            checkLocation();
        }, [user?.id])
    );

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

    const handleToggleWishlist = useCallback((id: string) => {
        toggleWishlist(id);
    }, [toggleWishlist]);

    const handleProductPress = useCallback((id: string) => {
        router.push(`/product/${id}` as any);
    }, [router]);

    // Use API products
    const displayProducts = apiProducts;

    // Derived Flash Sale products
    const flashSaleProducts = useMemo(() => {
        // Only show products if flash sale is globally active in config
        if (!config?.flashSale?.active) return [];

        // If config provides a specific list of product IDs, use that.
        // Otherwise fallback to checking the isFlashSale flag on individual products.
        if (config.flashSale.products && config.flashSale.products.length > 0) {
            return displayProducts.filter(p => config.flashSale.products?.includes(p._id));
        }

        return displayProducts.filter(p => p.isFlashSale);
    }, [displayProducts, config]);

    // Dynamic Categories derived from products
    const dynamicCategories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(displayProducts.map(p => p.category).filter(Boolean)));
        const formatted = uniqueCategories.map(cat => ({
            id: cat.toLowerCase(),
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            image: getCategoryImage(cat)
        }));
        return [{ id: "all", name: "All", image: CATEGORY_IMAGES.all }, ...formatted];
    }, [displayProducts]);

    // Current active category (from URL or 'all')
    const activeCategory = useMemo(() => categoryParam?.toLowerCase() || "all", [categoryParam]);

    // Filter products by search and category
    const filteredProducts = useMemo(() => {
        let result = displayProducts;

        // Filter by category
        if (activeCategory !== "all") {
            result = result.filter(p =>
                p.category?.toLowerCase().includes(activeCategory)
            );
        }

        // Filter by search text
        if (searchText.trim()) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        return result;
    }, [displayProducts, activeCategory, searchText]);

    const handleLocationUpdate = useCallback((zone: string, area: string, city?: string, isLive?: boolean) => {
        setUserZone(zone);
        setUserArea(area);
        setUserCity(city || null);
        setIsLiveLocation(!!isLive);
    }, []);

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

    const keyExtractor = useCallback((item: Product) => item._id, []);

    const ListEmpty = useCallback(() => (
        <View className="items-center py-12 px-6">
            <Ionicons name="search-outline" size={48} color="#9CA3AF" />
            <Text className="text-text-secondary text-center mt-4 text-xs">
                No products found for "{searchText || activeCategory}"
            </Text>
        </View>
    ), [searchText, activeCategory]);

    const ListHeader = useMemo(() => (
        <View>
            <HeroCarousel />
            <HomeCategories categories={dynamicCategories} activeCategory={activeCategory} />
            {(config?.flashSale?.active || config?.flashSale?.status === "SCHEDULED") && (
                <FlashSaleSection
                    products={flashSaleProducts}
                    onProductPress={handleProductPress}
                    targetTime={config?.flashSale?.status === "SCHEDULED" ? config.flashSale.startTime : config?.flashSale?.endTime}
                    title={config?.flashSale?.title}
                    status={config?.flashSale?.status}
                />
            )}

            <View
                onLayout={(event) => setPopularItemsY(event.nativeEvent.layout.y)}
                className="px-6 flex-row justify-between items-center mt-6 mb-4"
            >
                <Text className="text-base font-bold text-text-primary">Just For You</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/search" as any)}>
                    <Text className="text-primary text-xs font-medium">See All</Text>
                </TouchableOpacity>
            </View>

            {isLoading && !isSwitching && (
                <View className="items-center py-8">
                    <ActivityIndicator size="large" color="#5E2D87" />
                </View>
            )}
        </View>
    ), [dynamicCategories, activeCategory, flashSaleProducts, isLoading, isSwitching, router, handleProductPress]);

    return (
        <SafeScreen>
            <View className="flex-1 bg-background">
                {/* Integrated Row Header */}
                <Animated.View
                    pointerEvents="box-none"
                    style={{
                        transform: [{ translateY: headerTranslateY }],
                        paddingTop: 4, // Reduced padding to move header to top
                    }}
                    className="absolute top-0 left-0 right-0 z-50 px-4 pb-1"
                >
                    <Animated.View pointerEvents="none" style={{ opacity: headerOpacity, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                        <BlurView intensity={100} tint="light" style={{ flex: 1 }} />
                    </Animated.View>

                    <LinearGradient
                        pointerEvents="none"
                        colors={['rgba(0,0,0,0.6)', 'transparent']}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160 }}
                    />

                    <View className="flex-row items-center gap-x-2">
                        {/* Location Pill (Left) */}
                        <TouchableOpacity
                            onPress={() => setLocationModalVisible(true)}
                            className="flex-row items-center bg-white/90 rounded-full px-3 py-2 border border-white/20 shadow-sm"
                            style={{ maxWidth: '38%' }}
                        >
                            <Ionicons
                                name={isLiveLocation ? "navigate" : "location-sharp"}
                                size={13}
                                color="#5E2D87"
                            />
                            <Text
                                className="text-text-primary font-bold text-xs ml-1 flex-1"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {!isLocationLoaded ? "..." : (isLiveLocation ? userArea : userArea || userZone)}
                            </Text>
                            <Ionicons name="chevron-down" size={11} color="#5E2D87" style={{ marginLeft: 2 }} />
                        </TouchableOpacity>

                        {/* Search Bar (Stretched - Logo removed as per client request) */}
                        <BlurView intensity={90} tint="light" className="flex-1 rounded-full overflow-hidden flex-row items-center px-4 h-10 border border-white/40 shadow-sm">
                            <Ionicons name="search" size={15} color="#4B5563" />
                            <SearchInput
                                value={searchText}
                                onChangeText={setSearchText}
                                placeholder="Search products..."
                                containerStyle={{ flex: 1, height: '100%', marginBottom: 0 }}
                                inputStyle={{ fontSize: 13, height: '100%', color: '#1F2937' }}
                                hideFilter
                            />
                        </BlurView>
                    </View>
                </Animated.View>

                <Animated.FlatList
                    ref={scrollViewRef as any}
                    data={isSwitching ? [] : filteredProducts}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    numColumns={3}
                    ListHeaderComponent={ListHeader}
                    ListEmptyComponent={!isSwitching ? ListEmpty : null}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    columnWrapperStyle={{ paddingHorizontal: 16, justifyContent: 'flex-start', gap: 10 }}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                    initialNumToRender={12}
                    maxToRenderPerBatch={10}
                    windowSize={7}
                    updateCellsBatchingPeriod={50}
                    removeClippedSubviews={true}
                    getItemLayout={(_, index) => ({
                        length: 160,
                        offset: 160 * index,
                        index,
                    })}
                />

                {/* Location Selection Modal */}
                <LocationSelectionModal
                    visible={locationModalVisible}
                    onClose={() => setLocationModalVisible(false)}
                    currentZone={userZone}
                    currentArea={userArea}
                    currentCity={userCity}
                    isLive={isLiveLocation}
                    onLocationUpdate={handleLocationUpdate}
                />
            </View>
        </SafeScreen>
    );
}
