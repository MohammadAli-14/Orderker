import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
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

// Icon mapping for dynamic categories
const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes("dairy") || cat.includes("milk")) return "water";
  if (cat.includes("snack") || cat.includes("chips")) return "fast-food";
  if (cat.includes("bev") || cat.includes("drink") || cat.includes("juice")) return "wine";
  if (cat.includes("fruit") || cat.includes("phal")) return "nutrition";
  if (cat.includes("veg") || cat.includes("sabzi")) return "leaf";
  if (cat.includes("fresh")) return "leaf";
  if (cat.includes("food")) return "restaurant";
  if (cat.includes("hygiene") || cat.includes("wash") || cat.includes("clean") || cat.includes("personal")) return "medkit";
  return "grid"; // Default icon
};

// Fallback mock data if API fails
const MOCK_PRODUCTS = [
  { _id: "mock1", name: "Lassi (Sweet)", price: 120, category: "dairy", images: ["https://via.placeholder.com/150"], averageRating: 4.8, totalReviews: 128 },
  { _id: "mock2", name: "Chips (Masala)", price: 60, category: "snacks", images: ["https://via.placeholder.com/150"], averageRating: 4.5, totalReviews: 86 },
  { _id: "mock3", name: "Biscuits (Digestive)", price: 80, category: "snacks", images: ["https://via.placeholder.com/150"], averageRating: 4.9, totalReviews: 210 },
  { _id: "mock4", name: "Hand Wash", price: 200, category: "personal care", images: ["https://via.placeholder.com/150"], averageRating: 4.7, totalReviews: 150 },
  { _id: "mock5", name: "Fresh Milk", price: 180, category: "dairy", images: ["https://via.placeholder.com/150"], averageRating: 4.6, totalReviews: 95 },
  { _id: "mock6", name: "Orange Juice", price: 250, category: "beverages", images: ["https://via.placeholder.com/150"], averageRating: 4.4, totalReviews: 72 },
];

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  const { category: categoryParam } = useLocalSearchParams<{ category: string }>();

  const scrollViewRef = useRef<ScrollView>(null);
  const [popularItemsY, setPopularItemsY] = useState(0);

  // Load saved location and check for onboarding
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

          if (savedZone) {
            setUserZone(savedZone);
          } else {
            setUserZone("Malir"); // Default UI state
          }

          if (savedArea) {
            setUserArea(savedArea);
          } else {
            setUserArea("Malir Cantt"); // Default UI state
          }

          if (savedCity) setUserCity(savedCity || null);
          if (savedMode === "auto") setIsLiveLocation(true);
          else setIsLiveLocation(false);

          setIsLocationLoaded(true);

          if (!savedZone || !savedArea) {
            setTimeout(() => setLocationModalVisible(true), 1500);
          }

          if (categoryParam) {
            setSelectedCategory(categoryParam);

            // Auto-scroll to products when a category is selected via carousel/params
            // Delayed slightly to ensure layout is ready and list is filtered
            setTimeout(() => {
              if (scrollViewRef.current && popularItemsY > 0) {
                scrollViewRef.current.scrollTo({
                  y: popularItemsY - 20, // Offset a bit for better visibility
                  animated: true,
                });
              }
            }, 300);
          }
        } catch (error) {
          console.error("Error checking location onboarding:", error);
          setIsLocationLoaded(true);
        }
      };

      checkLocation();
    }, [user?.id, categoryParam, popularItemsY])
  );

  const handleAddToCart = (product: any) => {
    addToCart(
      { productId: product._id, quantity: 1 },
      {
        onSuccess: () => Alert.alert("Success", `${product.name} added to cart!`),
        onError: (error: any) => {
          Alert.alert("Error", error?.response?.data?.message || "Failed to add to cart");
        },
      }
    );
  };

  // Use API products or fallback to mock
  // We only fallback to mock if API has finished loading and returned nothing
  const displayProducts = useMemo(() => {
    if (isLoading && apiProducts.length === 0) return MOCK_PRODUCTS;
    return apiProducts.length > 0 ? apiProducts : MOCK_PRODUCTS;
  }, [apiProducts, isLoading]);

  // Dynamic Categories derived from products
  const dynamicCategories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(displayProducts.map(p => p.category).filter(Boolean)));
    const formatted = uniqueCategories.map(cat => ({
      id: cat.toLowerCase(),
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      icon: getCategoryIcon(cat)
    }));
    return [{ id: "all", name: "All", icon: "grid" }, ...formatted];
  }, [displayProducts]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    let result = displayProducts;

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(p =>
        p.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by search text
    if (searchText.trim()) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return result;
  }, [displayProducts, selectedCategory, searchText]);

  const handleLocationUpdate = (zone: string, area: string, city?: string, isLive?: boolean) => {
    setUserZone(zone);
    setUserArea(area);
    setUserCity(city || null);
    setIsLiveLocation(!!isLive);
  };

  return (
    <SafeScreen>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-primary pt-4 pb-6 px-6 rounded-b-3xl shadow-lg">
          <View className="flex-row justify-between items-center mb-5">
            <View className="flex-1">
              <Text className="text-purple-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                Your Location
              </Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setLocationModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isLiveLocation ? "navigate" : "location"}
                  size={14}
                  color={isLiveLocation ? "#10B981" : "white"}
                />
                <Text className="text-white font-bold text-base ml-1" numberOfLines={1}>
                  {!isLocationLoaded ? "Updating location..." : (isLiveLocation ? `${userArea}, ${userCity || userZone}` : `${userArea}, ${userZone}`)}
                </Text>
                <Ionicons name="chevron-down" size={14} color="white" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
            <View className="bg-white px-2.5 py-1 rounded-xl shadow-sm">
              <Image
                source={require("@/assets/images/orderker-logo-full.png")}
                style={{ width: 70, height: 20 }}
                contentFit="contain"
              />
            </View>
          </View>

          {/* Search */}
          <SearchInput
            value={searchText}
            onChangeText={setSearchText}
            onFilterPress={() => { }}
          />
        </View>

        {/* Categories Header */}
        <View className="px-6 flex-row justify-between items-center mt-6 mb-4">
          <Text className="text-lg font-bold text-text-primary">Categories</Text>
          <TouchableOpacity>
            <Text className="text-primary font-medium">See All</Text>
          </TouchableOpacity>
        </View>

        {/* Categories List */}
        <View className="mb-6 pl-6">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={dynamicCategories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`mr-3 px-4 py-2.5 rounded-xl flex-row items-center ${selectedCategory === item.id
                  ? "bg-primary"
                  : "bg-white border border-gray-100"
                  }`}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={selectedCategory === item.id ? "white" : "#5E2D87"}
                />
                <Text
                  className={`ml-2 font-medium ${selectedCategory === item.id ? "text-white" : "text-text-primary"
                    }`}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Hero Banner Carousel */}
        <HeroCarousel />

        {/* Popular Items Header */}
        <View
          onLayout={(event) => setPopularItemsY(event.nativeEvent.layout.y)}
          className="px-6 flex-row justify-between items-center mb-4"
        >
          <Text className="text-lg font-bold text-text-primary">Popular Items</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
            <Text className="text-primary font-medium">See All</Text>
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
            <Text className="text-text-secondary text-center mt-4">No products found matching "{searchText || selectedCategory}"</Text>
          </View>
        )}

        <View className="px-6 flex-row flex-wrap justify-between">
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
        </View>

      </ScrollView>

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
    </SafeScreen>
  );
}
