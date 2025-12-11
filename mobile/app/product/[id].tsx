import SafeScreen from "@/components/SafeScreen";
import useCart from "@/hooks/useCart";
import { useProduct } from "@/hooks/useProduct";
import useWishlist from "@/hooks/useWishlist";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isError, isLoading } = useProduct(id);
  const { addToCart, isAddingToCart } = useCart();

  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } =
    useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      { productId: product._id, quantity },
      {
        onSuccess: () => Alert.alert("Success", `${product.name} added to cart!`),
        onError: (error: any) => {
          Alert.alert("Error", error?.response?.data?.error || "Failed to add to cart");
        },
      }
    );
  };

  if (isLoading) return <LoadingUI />;
  if (isError || !product) return <ErrorUI />;

  const inStock = product.stock > 0;

  return (
    <SafeScreen>
      {/* HEADER */}
      <View className="absolute top-0 left-0 right-0 z-10 px-6 pt-20 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          className="bg-black/50 backdrop-blur-xl w-12 h-12 rounded-full items-center justify-center"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          className={`w-12 h-12 rounded-full items-center justify-center ${
            isInWishlist(product._id) ? "bg-primary" : "bg-black/50 backdrop-blur-xl"
          }`}
          onPress={() => toggleWishlist(product._id)}
          disabled={isAddingToWishlist || isRemovingFromWishlist}
          activeOpacity={0.7}
        >
          {isAddingToWishlist || isRemovingFromWishlist ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons
              name={isInWishlist(product._id) ? "heart" : "heart-outline"}
              size={24}
              color={isInWishlist(product._id) ? "#121212" : "#FFFFFF"}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* IMAGE GALLERY */}
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {product.images.map((image: string, index: number) => (
              <View key={index} style={{ width }}>
                <Image source={image} style={{ width, height: 400 }} contentFit="cover" />
              </View>
            ))}
          </ScrollView>

          {/* Image Indicators */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
            {product.images.map((_: any, index: number) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === selectedImageIndex ? "bg-primary w-6" : "bg-white/50 w-2"
                }`}
              />
            ))}
          </View>
        </View>

        {/* PRODUCT INFO */}
        <View className="p-6">
          {/* Category */}
          <View className="flex-row items-center mb-3">
            <View className="bg-primary/20 px-3 py-1 rounded-full">
              <Text className="text-primary text-xs font-bold">{product.category}</Text>
            </View>
          </View>

          {/* Product Name */}
          <Text className="text-text-primary text-3xl font-bold mb-3">{product.name}</Text>

          {/* Rating & Reviews */}
          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center bg-surface px-3 py-2 rounded-full">
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text className="text-text-primary font-bold ml-1 mr-2">
                {product.averageRating.toFixed(1)}
              </Text>
              <Text className="text-text-secondary text-sm">({product.totalReviews} reviews)</Text>
            </View>
            {inStock ? (
              <View className="ml-3 flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-green-500 font-semibold text-sm">
                  {product.stock} in stock
                </Text>
              </View>
            ) : (
              <View className="ml-3 flex-row items-center">
                <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                <Text className="text-red-500 font-semibold text-sm">Out of Stock</Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View className="flex-row items-center mb-6">
            <Text className="text-primary text-4xl font-bold">${product.price.toFixed(2)}</Text>
          </View>

          {/* Quantity */}
          <View className="mb-6">
            <Text className="text-text-primary text-lg font-bold mb-3">Quantity</Text>

            <View className="flex-row items-center">
              <TouchableOpacity
                className="bg-surface rounded-full w-12 h-12 items-center justify-center"
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                activeOpacity={0.7}
                disabled={!inStock}
              >
                <Ionicons name="remove" size={24} color={inStock ? "#FFFFFF" : "#666"} />
              </TouchableOpacity>

              <Text className="text-text-primary text-xl font-bold mx-6">{quantity}</Text>

              <TouchableOpacity
                className="bg-primary rounded-full w-12 h-12 items-center justify-center"
                onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                activeOpacity={0.7}
                disabled={!inStock || quantity >= product.stock}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={!inStock || quantity >= product.stock ? "#666" : "#121212"}
                />
              </TouchableOpacity>
            </View>

            {quantity >= product.stock && inStock && (
              <Text className="text-orange-500 text-sm mt-2">Maximum stock reached</Text>
            )}
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text className="text-text-primary text-lg font-bold mb-3">Description</Text>
            <Text className="text-text-secondary text-base leading-6">{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-surface px-6 py-4 pb-8">
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <Text className="text-text-secondary text-sm mb-1">Total Price</Text>
            <Text className="text-primary text-2xl font-bold">
              ${(product.price * quantity).toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            className={`rounded-2xl px-8 py-4 flex-row items-center ${
              !inStock ? "bg-surface" : "bg-primary"
            }`}
            activeOpacity={0.8}
            onPress={handleAddToCart}
            disabled={!inStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color="#121212" />
            ) : (
              <>
                <Ionicons name="cart" size={24} color={!inStock ? "#666" : "#121212"} />
                <Text
                  className={`font-bold text-lg ml-2 ${
                    !inStock ? "text-text-secondary" : "text-background"
                  }`}
                >
                  {!inStock ? "Out of Stock" : "Add to Cart"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeScreen>
  );
};

export default ProductDetailScreen;

function ErrorUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text className="text-text-primary font-semibold text-xl mt-4">Product not found</Text>
        <Text className="text-text-secondary text-center mt-2">
          This product may have been removed or doesn&apos;t exist
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-2xl px-6 py-3 mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-background font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

function LoadingUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1DB954" />
        <Text className="text-text-secondary mt-4">Loading product...</Text>
      </View>
    </SafeScreen>
  );
}
