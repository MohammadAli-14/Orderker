import SafeScreen from "@/components/SafeScreen";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Image,
} from "react-native";
import { useState } from "react";
import OrderRatingModal from "@/components/OrderRatingModal";
import { Order } from "@/types";

const OrdersScreen = () => {
  const router = useRouter();
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useOrders();
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const flatOrders = data?.pages.flatMap((page) => page.orders) || [];

  const handleLeaveRating = (order: Order) => {
    setSelectedOrder(order);
    setIsRatingModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-orange-100 text-orange-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading && !isFetchingNextPage) {
    return (
      <SafeScreen>
        <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2 mr-2"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-primary">My Orders</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5E2D87" />
        </View>
      </SafeScreen>
    );
  }

  if (isError) {
    return (
      <SafeScreen>
        <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2 mr-2"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-primary">My Orders</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-text-primary text-xl font-bold mt-4">Failed to load orders</Text>
          <TouchableOpacity onPress={() => refetch()} className="mt-4 bg-primary px-6 py-3 rounded-full">
            <Text className="text-white font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center -ml-2 mr-2"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">My Orders</Text>
      </View>

      <FlatList
        data={flatOrders}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading && !isFetchingNextPage} onRefresh={refetch} colors={["#5E2D87"]} />}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator color="#5E2D87" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4">
              <Ionicons name="bag-handle-outline" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-text-primary text-xl font-bold">No orders yet</Text>
            <Text className="text-text-secondary text-center mt-2">
              Start shopping to see your orders here
            </Text>
          </View>
        }
        renderItem={({ item: order }) => {
          const statusConfig = getStatusColor(order.status);
          const [bgClass, textClass] = statusConfig.split(" ");
          const firstItem = order.orderItems[0];
          const itemCount = order.orderItems.length;

          return (
            <View
              className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm"
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  const productId = typeof firstItem?.product === 'string'
                    ? firstItem.product
                    : firstItem?.product?._id;

                  if (productId) {
                    router.push(`/product/${productId}` as any);
                  }
                }}
              >
                <View className="flex-row gap-4">
                  {/* Image */}
                  <View className="w-24 h-24 bg-gray-50 rounded-xl items-center justify-center relative overflow-hidden">
                    {firstItem?.image ? (
                      <Image
                        source={{ uri: firstItem.image }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="cube-outline" size={32} color="#9CA3AF" />
                    )}
                    {itemCount > 1 && (
                      <View className="absolute bottom-0 right-0 bg-primary px-1.5 py-0.5 rounded-tl-lg">
                        <Text className="text-white text-[10px] font-bold">+{itemCount - 1}</Text>
                      </View>
                    )}
                  </View>

                  {/* Content */}
                  <View className="flex-1 justify-between">
                    <View>
                      <View className="flex-row justify-between items-start mb-1">
                        <Text className="font-bold text-sm text-text-primary">Order #{order._id.slice(-8).toUpperCase()}</Text>
                        <View className={`px-2 py-1 rounded-full ${bgClass}`}>
                          <Text className={`text-[10px] font-bold uppercase tracking-wide ${textClass}`}>
                            {order.status}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xs text-text-secondary mb-1">{formatDate(order.createdAt)}</Text>
                      <Text className="text-sm text-text-primary line-clamp-1" numberOfLines={1}>
                        {firstItem?.name} {itemCount > 1 && ", ..."}
                      </Text>
                      <Text className="text-xs text-text-secondary mt-1">{itemCount} items</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              <View className="h-px bg-gray-100 w-full my-4" />

              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-lg text-primary">{formatCurrency(order.totalPrice)}</Text>

                {order.status === "delivered" ? (
                  <TouchableOpacity
                    onPress={() => handleLeaveRating(order)}
                    disabled={order.hasReviewed}
                    className={`flex-row items-center px-3 py-1.5 rounded-lg ${order.hasReviewed ? 'bg-gray-100' : 'bg-primary/10'}`}
                  >
                    <Ionicons name="star" size={14} color={order.hasReviewed ? "#9CA3AF" : "#5E2D87"} />
                    <Text className={`text-xs font-semibold ml-1.5 ${order.hasReviewed ? 'text-gray-400' : 'text-primary'}`}>
                      {order.hasReviewed ? "Rating Submitted" : "Leave Rating"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => router.push(`/(profile)/order/${order._id}` as any)}
                    activeOpacity={0.7}
                    accessibilityLabel="Track Order"
                    accessibilityRole="button"
                  >
                    <Text className="text-sm font-medium text-primary">Track Order</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      <OrderRatingModal
        visible={isRatingModalVisible}
        onClose={() => {
          setIsRatingModalVisible(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </SafeScreen>
  );
};

export default OrdersScreen;
