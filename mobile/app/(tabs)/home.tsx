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

    // API Hooks
    const { data: apiProducts = [], isLoading, isError } = useProducts();
    const { addToCart, isAddingToCart } = useCart();
    const wishlistProps = useWishlist();
    const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } = wishlistProps;
    const { showToast } = useToast();

    const { category: categoryParam } = useLocalSearchParams<{ category: string }>();

    const scrollViewRef = useRef<ScrollView>(null);
    const scrollY = useRef(new Animated.Value(0)).current;
    const [popularItemsY, setPopularItemsY] = useState(0);

    // Flash Sale Timer State
    const [timeLeft, setTimeLeft] = useState({ hours: "02", minutes: "45", seconds: "12" });

    // Live Timer Effect
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            // Simulate a countdown ending at the end of the day or every 4 hours
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const diff = endOfDay.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft({ hours: "00", minutes: "00", seconds: "01" });
                return;
            }

            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            setTimeLeft({
                hours: h.toString().padStart(2, '0'),
                minutes: m.toString().padStart(2, '0'),
                seconds: s.toString().padStart(2, '0')
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

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

    // Auto-scroll to products section when category changes
    useEffect(() => {
        if (categoryParam && scrollViewRef.current && popularItemsY > 0) {
            scrollViewRef.current.scrollTo({
                y: popularItemsY - 20,
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
                    console.error("Error checking location onboarding:", error);
                    setIsLocationLoaded(true);
                }
            };
            checkLocation();
        }, [user?.id])
    );

    const handleAddToCart = (product: any) => {
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
    };

    // Use API products
    const displayProducts = apiProducts;

    // Derived Flash Sale products
    const flashSaleProducts = useMemo(() => {
        return displayProducts.filter(p => p.isFlashSale);
    }, [displayProducts]);

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

    const handleLocationUpdate = (zone: string, area: string, city?: string, isLive?: boolean) => {
        setUserZone(zone);
        setUserArea(area);
        setUserCity(city || null);
        setIsLiveLocation(!!isLive);
    };

    return (
        <SafeScreen>
            <View className="flex-1 bg-background">
                {/* Integrated Row Header */}
                <Animated.View
                    style={{
                        transform: [{ translateY: headerTranslateY }],
                        paddingTop: 36, // Moved further upward as requested
                    }}
                    className="absolute top-0 left-0 right-0 z-50 px-4 pb-1"
                >
                    <Animated.View style={{ opacity: headerOpacity, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                        <BlurView intensity={100} tint="light" style={{ flex: 1 }} />
                    </Animated.View>

                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent']}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160 }}
                    />

                    <View className="flex-row items-center justify-between space-x-2">
                        {/* Location (Left) */}
                        <TouchableOpacity
                            onPress={() => setLocationModalVisible(true)}
                            className="flex-row items-center bg-white/90 rounded-full px-2.5 py-1.5 border border-white/20 shadow-sm"
                            style={{ flexShrink: 1, maxWidth: '30%' }}
                        >
                            <Ionicons
                                name={isLiveLocation ? "navigate" : "location-sharp"}
                                size={12}
                                color="#5E2D87"
                            />
                            <Text
                                className="text-text-primary font-bold text-[10px] ml-1 flex-1"
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {!isLocationLoaded ? "..." : (isLiveLocation ? userArea : userArea || userZone)}
                            </Text>
                            <Ionicons name="chevron-down" size={10} color="#5E2D87" style={{ marginLeft: 2 }} />
                        </TouchableOpacity>

                        {/* Search (Center) */}
                        <BlurView intensity={90} tint="light" className="flex-1 rounded-full overflow-hidden flex-row items-center px-4 h-10 border border-white/40 shadow-sm">
                            <Ionicons name="search" size={14} color="#1F2937" />
                            <SearchInput
                                value={searchText}
                                onChangeText={setSearchText}
                                placeholder="Search products..."
                                containerStyle={{ flex: 1, height: '100%', marginBottom: 0 }}
                                inputStyle={{ fontSize: 13, height: '100%', color: '#1F2937' }}
                                hideFilter
                            />
                        </BlurView>

                        {/* Logo (Right) */}
                        <View className="bg-white/95 rounded-xl px-2.5 py-1.5 border border-white/20 shadow-sm">
                            <Image
                                source={require("@/assets/images/orderker-logo-full.png")}
                                style={{ width: 48, height: 16 }}
                                contentFit="contain"
                            />
                        </View>
                    </View>
                </Animated.View>

                <Animated.ScrollView
                    ref={scrollViewRef as any}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    {/* Hero Banner at Top */}
                    <HeroCarousel />

                    {/* Categories Section - Now below Carousel */}
                    <View className="bg-white -mt-6 rounded-t-[32px] pt-6 pb-2">
                        <View className="px-6 flex-row justify-between items-center mb-4">
                            <Text className="text-base font-bold text-text-primary">Categories</Text>
                            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
                                <Text className="text-primary text-xs font-medium">See All</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
                            className="flex-row"
                        >
                            {dynamicCategories.map((item) => {
                                const isSelected = activeCategory === item.id;
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        className="mr-5 items-center"
                                        onPress={() => router.setParams({ category: item.id })}
                                    >
                                        <View
                                            className="w-16 h-16 rounded-3xl items-center justify-center border overflow-hidden"
                                            style={{
                                                backgroundColor: isSelected ? "white" : "#F9FAFB",
                                                borderColor: isSelected ? "#5E2D87" : "#F3F4F6",
                                                borderWidth: isSelected ? 2 : 1,
                                                shadowColor: isSelected ? "#5E2D87" : "#000",
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: isSelected ? 0.2 : 0.05,
                                                shadowRadius: 8,
                                                elevation: isSelected ? 4 : 2,
                                            }}
                                        >
                                            <Image
                                                source={item.image}
                                                style={{ width: 44, height: 44 }}
                                                contentFit="contain"
                                            />
                                        </View>
                                        <Text
                                            className="mt-2 text-[10px] font-medium"
                                            style={{
                                                color: isSelected ? "#5E2D87" : "#6B7280",
                                                fontWeight: isSelected ? "bold" : "500"
                                            }}
                                        >
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Flash Sale Section */}
                    <View className="px-6 mt-4">
                        <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                <Text className="text-base font-bold text-accent-red italic mr-2">FLASH SALE</Text>
                                <View className="bg-accent-red px-1.5 py-0.5 rounded flex-row items-center">
                                    <Ionicons name="time-outline" size={10} color="white" style={{ marginRight: 2 }} />
                                    <Text className="text-white text-[10px] font-bold">
                                        {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-2 px-2">
                            {flashSaleProducts.map((item) => {
                                const salePrice = calculateFinalPrice(item.price, item.isFlashSale, item.discountPercent || 0);
                                const discount = item.discountPercent || 0;
                                const stockLeft = item.stock;

                                return (
                                    <TouchableOpacity
                                        key={`flash-${item._id}`}
                                        className="w-32 bg-white rounded-2xl p-3 mr-3 border border-gray-100 shadow-sm"
                                        style={{ elevation: 2 }}
                                        onPress={() => router.push(`/product/${item._id}`)}
                                    >
                                        <View className="bg-gray-50 rounded-xl p-2 mb-2 w-full aspect-square relative items-center justify-center">
                                            <Image
                                                source={{ uri: item.images?.[1] || item.images?.[0] || "https://via.placeholder.com/150" }}
                                                style={{ width: '85%', height: '85%' }}
                                                contentFit="contain"
                                            />
                                            <View
                                                className="absolute top-0 left-0 px-2 py-1 rounded-br-xl rounded-tl-xl"
                                                style={{ backgroundColor: discount >= 50 ? "#EF4444" : "#F59E0B" }}
                                            >
                                                <Text className="text-white text-[9px] font-black">-{discount}%</Text>
                                            </View>
                                        </View>

                                        <Text className="text-[10px] font-medium text-gray-400 line-through mb-0.5" style={{ textDecorationLine: 'line-through' }}>
                                            Rs. {item.price}
                                        </Text>
                                        <Text className="text-sm font-black text-primary mb-1">Rs. {salePrice}</Text>

                                        <View className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                                            <View
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${Math.min(100, (stockLeft / 20) * 100)}%`,
                                                    backgroundColor: discount >= 50 ? "#EF4444" : "#F59E0B"
                                                }}
                                            />
                                        </View>
                                        <Text className="text-[8px] text-gray-400 mt-1 font-bold">{stockLeft} LEFT</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Popular Items Section */}
                    <View
                        onLayout={(event) => setPopularItemsY(event.nativeEvent.layout.y)}
                        className="px-6 flex-row justify-between items-center mt-6 mb-4"
                    >
                        <Text className="text-base font-bold text-text-primary">Just For You</Text>
                        <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
                            <Text className="text-primary text-xs font-medium">See All</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Loading / Error States */}
                    {isLoading && (
                        <View className="items-center py-8">
                            <ActivityIndicator size="large" color="#5E2D87" />
                        </View>
                    )}

                    {/* Products Grid */}
                    {!isLoading && filteredProducts.length === 0 && (
                        <View className="items-center py-8 px-6">
                            <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                            <Text className="text-text-secondary text-center mt-4 text-xs">No products found for "{searchText || activeCategory}"</Text>
                        </View>
                    )}

                    <View className="px-4 flex-row flex-wrap justify-between">
                        {filteredProducts.map((item) => (
                            <View key={item._id} className="w-[31.5%] mb-3">
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
                                    isFlashSale={item.isFlashSale}
                                    discountPercent={item.discountPercent}
                                    compact={true}
                                />
                            </View>
                        ))}
                    </View>
                </Animated.ScrollView>

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
