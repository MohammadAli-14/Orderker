import SafeScreen from "@/components/SafeScreen";
import { useDashboardKPI } from "@/hooks/useDashboard";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
    RefreshControl,
    Image,
    Alert,
} from "react-native";
import OrderRatingModal from "@/components/OrderRatingModal";
import { Order } from "@/types";

const KPI_CARDS = [
    { key: "totalOrders", label: "Total Orders", icon: "bag-handle" as const, bg: "#F3EEFA", color: "#5E2D87" },
    { key: "totalSpent", label: "Total Spent", icon: "wallet" as const, bg: "#F3EEFA", color: "#5E2D87" },
    { key: "deliveredOrders", label: "Delivered", icon: "checkmark-circle" as const, bg: "#D1FAE5", color: "#10B981" },
    { key: "pendingOrders", label: "Pending", icon: "time" as const, bg: "#FEF3C7", color: "#F59E0B" },
];

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "pending":
            return "bg-orange-100 text-orange-700";
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

const DashboardScreen = () => {
    const router = useRouter();
    const { user } = useUser();
    const { data: kpi, isLoading: kpiLoading, refetch: refetchKPI } = useDashboardKPI();
    const {
        data,
        isLoading: ordersLoading,
        refetch: refetchOrders,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useOrders();

    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const flatOrders = data?.pages.flatMap((page) => page.orders) || [];
    const isRefreshing = (kpiLoading || ordersLoading) && !isFetchingNextPage;

    const handleRefresh = () => {
        refetchKPI();
        refetchOrders();
    };

    const handleLeaveRating = (order: Order) => {
        setSelectedOrder(order);
        setIsRatingModalVisible(true);
    };

    const getKPIValue = (key: string) => {
        if (!kpi) return "—";
        switch (key) {
            case "totalOrders":
                return kpi.totalOrders.toString();
            case "totalSpent":
                return formatCurrency(kpi.totalSpent);
            case "deliveredOrders":
                return kpi.deliveredOrders.toString();
            case "pendingOrders":
                return kpi.pendingOrders.toString();
            default:
                return "0";
        }
    };

    const renderHeader = () => (
        <View>
            {/* Greeting */}
            <View className="px-6 pt-2 pb-4">
                <Text className="text-2xl font-bold text-text-primary">
                    My Dashboard
                </Text>
                <Text className="text-sm text-text-secondary mt-1">
                    Hello, {user?.firstName || "there"}! 👋
                </Text>
            </View>

            {/* KPI Cards */}
            <View className="px-5 flex-row flex-wrap justify-between mb-4">
                {KPI_CARDS.map((card) => (
                    <View
                        key={card.key}
                        className="rounded-2xl p-4 mb-3"
                        style={{
                            width: "48%",
                            backgroundColor: card.bg,
                            shadowColor: card.color,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 2,
                        }}
                    >
                        <View
                            className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                            style={{ backgroundColor: card.color + "25" }}
                        >
                            <Ionicons name={card.icon} size={20} color={card.color} />
                        </View>
                        <Text
                            className="text-xl font-bold"
                            style={{ color: card.color }}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {kpiLoading ? "..." : getKPIValue(card.key)}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-1 font-medium">
                            {card.label}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Orders Section Header */}
            <View className="px-6 pb-3 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-text-primary">My Orders</Text>
                <Text className="text-xs text-text-secondary">
                    {flatOrders.length} order{flatOrders.length !== 1 ? "s" : ""}
                </Text>
            </View>
        </View>
    );

    const renderOrderItem = ({ item: order }: { item: Order }) => {
        const statusConfig = getStatusColor(order.status);
        const [bgClass, textClass] = statusConfig.split(" ");
        const firstItem = order.orderItems[0];
        const itemCount = order.orderItems.length;

        const productId =
            typeof firstItem?.product === "string"
                ? firstItem.product
                : firstItem?.product?._id;


        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                    if (productId) {
                        router.push(`/product/${productId}` as any);
                    } else {
                        Alert.alert("Product Unavailable", "This product is no longer listed in our catalog.");
                    }
                }}
                className="bg-white rounded-2xl p-4 mb-3 mx-4 border border-gray-100 shadow-sm"
            >
                <View className="flex-row gap-4">
                    {/* Image */}
                    <View className="w-20 h-20 bg-gray-50 rounded-xl items-center justify-center relative overflow-hidden">
                        {firstItem?.image ? (
                            <Image
                                source={{ uri: firstItem.image }}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="cover"
                            />
                        ) : (
                            <Ionicons name="cube-outline" size={28} color="#9CA3AF" />
                        )}
                        {itemCount > 1 && (
                            <View className="absolute bottom-0 right-0 bg-primary px-1.5 py-0.5 rounded-tl-lg">
                                <Text className="text-white text-[9px] font-bold">
                                    +{itemCount - 1}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Content */}
                    <View className="flex-1 justify-between">
                        <View>
                            <View className="flex-row justify-between items-start mb-1">
                                <Text className="font-bold text-sm text-text-primary">
                                    Order #{order._id.slice(-8).toUpperCase()}
                                </Text>
                                <View className={`px-2 py-0.5 rounded-full ${bgClass}`}>
                                    <Text
                                        className={`text-[9px] font-bold uppercase tracking-wide ${textClass}`}
                                    >
                                        {order.status}
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-xs text-text-secondary mb-0.5">
                                {formatDate(order.createdAt)}
                            </Text>
                            <Text
                                className="text-xs text-text-primary line-clamp-1"
                                numberOfLines={1}
                            >
                                {firstItem?.name}
                                {itemCount > 1 && ", ..."}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="h-px bg-gray-100 w-full my-3" />

                <View className="flex-row items-center justify-between">
                    <Text className="font-bold text-base text-primary">
                        {formatCurrency(order.totalPrice)}
                    </Text>

                    {order.status === "delivered" ? (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                handleLeaveRating(order);
                            }}
                            disabled={order.hasReviewed}
                            className={`flex-row items-center px-3 py-1.5 rounded-lg ${order.hasReviewed ? "bg-gray-100" : "bg-primary/10"
                                }`}
                        >
                            <Ionicons
                                name="star"
                                size={12}
                                color={order.hasReviewed ? "#9CA3AF" : "#5E2D87"}
                            />
                            <Text
                                className={`text-[10px] font-semibold ml-1.5 ${order.hasReviewed ? "text-gray-400" : "text-primary"
                                    }`}
                            >
                                {order.hasReviewed ? "Rated" : "Leave Rating"}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                router.push(`/(profile)/order/${order._id}` as any);
                            }}
                            activeOpacity={0.7}
                        >
                            <Text className="text-xs font-medium text-primary">
                                Track Order
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeScreen>
            <FlatList
                data={flatOrders}
                keyExtractor={(item) => item._id}
                renderItem={renderOrderItem}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={["#5E2D87"]}
                        tintColor="#5E2D87"
                    />
                }
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
                    !ordersLoading ? (
                        <View className="items-center justify-center py-20">
                            <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4">
                                <Ionicons
                                    name="bag-handle-outline"
                                    size={40}
                                    color="#9CA3AF"
                                />
                            </View>
                            <Text className="text-text-primary text-xl font-bold">
                                No orders yet
                            </Text>
                            <Text className="text-text-secondary text-center mt-2 px-8">
                                Start shopping to see your orders here
                            </Text>
                            <TouchableOpacity
                                className="mt-6 bg-primary px-8 py-3 rounded-full"
                                onPress={() => router.push("/(tabs)/home")}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-bold">Start Shopping</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
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

export default DashboardScreen;
