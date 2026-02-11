import SafeScreen from "@/components/SafeScreen";
import { useOrderDetails } from "@/hooks/useOrders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, Alert, Linking } from "react-native";
import { useEffect } from "react";

export default function OrderTrackingScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { data: order, isLoading, isError, error } = useOrderDetails(id as string);

    const handleSupport = () => {
        const subject = `Support Request for Order #${id?.slice(-8).toUpperCase()}`;
        const body = `Hi Orderker Support,\n\nI need help with my order #${id}.\n\n[Please describe your issue here]`;
        const mailtoUrl = `mailto:orderker7@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        Linking.canOpenURL(mailtoUrl).then(supported => {
            if (supported) {
                Linking.openURL(mailtoUrl);
            } else {
                Alert.alert("Error", "No email app found on this device. Please contact us at orderker7@gmail.com");
            }
        });
    };

    // Diagnostic log
    useEffect(() => {
        if (isError) {
            console.error("OrderTrackingScreen fetch error:", error);
            Alert.alert("Fetch Error", `Failed to load order ${id}\n\n${(error as any)?.message || "Unknown error"}`);
        }
    }, [isError, id, error]);

    if (isLoading) return <LoadingUI />;
    if (isError || !order) return <ErrorUI />;

    const isCancelled = order.status === "cancelled";

    const steps = [
        {
            title: "Order Placed",
            time: formatDate(order.createdAt),
            status: "completed",
            icon: "checkmark-circle",
            description: "We've received your order"
        },
        ...(isCancelled ? [{
            title: "Cancelled",
            time: formatDate(order.updatedAt),
            status: "completed",
            icon: "close-circle",
            description: "This order has been cancelled",
            color: "#EF4444"
        }] : [
            {
                title: "Processing",
                time: order.status === "pending" ? "In Progress" : formatDate(order.createdAt),
                status: order.status === "pending" ? "current" : "completed",
                icon: "cog-outline",
                description: "Our team is preparing your items"
            },
            {
                title: "In Transit",
                time: order.shippedAt ? formatDate(order.shippedAt) : "Pending",
                status: order.status === "shipped" ? "current" : (order.status === "delivered" ? "completed" : "upcoming"),
                icon: "airplane-outline",
                description: "Your order is on the way"
            },
            {
                title: "Delivered",
                time: order.deliveredAt ? formatDate(order.deliveredAt) : "Pending",
                status: order.status === "delivered" ? "completed" : "upcoming",
                icon: "home-outline",
                description: "Enjoy your shopping!"
            }
        ])
    ];

    return (
        <SafeScreen>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center -ml-2 mr-2"
                >
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text-primary">Track Order</Text>
            </View>

            <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
                <View className="p-6">
                    {/* Order Summary Card */}
                    <View className="bg-primary/5 rounded-3xl p-6 mb-8 border border-primary/10">
                        <View className="flex-row justify-between items-center mb-4">
                            <View>
                                <Text className="text-text-secondary text-xs font-medium uppercase tracking-wider">Order ID</Text>
                                <Text className="text-text-primary font-bold text-lg">#{order._id.slice(-8).toUpperCase()}</Text>
                            </View>
                            <View className="bg-primary p-3 rounded-2xl">
                                <Ionicons name="cube" size={24} color="white" />
                            </View>
                        </View>
                        <View className="h-px bg-primary/10 w-full mb-4" />
                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className="text-text-secondary text-xs font-medium">Items</Text>
                                <Text className="text-text-primary font-bold">{order.orderItems.length} Products</Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-text-secondary text-xs font-medium">Total Amount</Text>
                                <Text className="text-primary font-bold text-lg">{formatCurrency(order.totalPrice)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Timeline */}
                    <Text className="text-lg font-bold text-text-primary mb-6">Delivery Progress</Text>

                    <View className="px-2">
                        {steps.map((step, index) => (
                            <View key={index} className="flex-row min-h-[80px]">
                                {/* Visual Line & Circle */}
                                <View className="items-center mr-4">
                                    <View
                                        className={`w-10 h-10 rounded-full items-center justify-center z-10 
                      ${step.status === 'completed' ? 'bg-primary' : (step.status === 'current' ? 'bg-primary/20 border-2 border-primary' : 'bg-gray-100')}`}
                                    >
                                        <Ionicons
                                            name={step.icon as any}
                                            size={20}
                                            color={step.status === 'completed' ? 'white' : (step.status === 'current' ? '#5E2D87' : '#9CA3AF')}
                                        />
                                    </View>
                                    {index < steps.length - 1 && (
                                        <View
                                            className={`w-[2px] flex-1 -my-1 ${step.status === 'completed' ? 'bg-primary' : 'bg-gray-100'}`}
                                        />
                                    )}
                                </View>

                                {/* Content */}
                                <View className="flex-1 pb-8">
                                    <View className="flex-row justify-between items-center mb-1">
                                        <Text className={`font-bold text-base ${step.status === 'upcoming' ? 'text-text-secondary' : 'text-text-primary'}`}>
                                            {step.title}
                                        </Text>
                                        <Text className={`text-[10px] font-bold ${step.status === 'upcoming' ? 'text-text-tertiary' : 'text-primary'}`}>
                                            {step.time}
                                        </Text>
                                    </View>
                                    <Text className={`text-sm ${step.status === 'upcoming' ? 'text-text-tertiary' : 'text-text-secondary'}`}>
                                        {step.description}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Shipping Address */}
                    <View className="bg-gray-50 rounded-3xl p-6 mt-4">
                        <View className="flex-row items-center mb-4">
                            <View className="bg-white p-2 rounded-xl border border-gray-100">
                                <Ionicons name="location" size={20} color="#5E2D87" />
                            </View>
                            <Text className="text-base font-bold text-text-primary ml-3">Delivery Address</Text>
                        </View>
                        <Text className="text-sm font-semibold text-text-primary mb-1">{order.shippingAddress.fullName}</Text>
                        <Text className="text-sm text-text-secondary leading-5">
                            {order.shippingAddress.streetAddress}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </Text>
                        <Text className="text-sm text-text-secondary mt-2">{order.shippingAddress.phoneNumber}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Support */}
            <View className="p-6 border-t border-gray-100 bg-white">
                <TouchableOpacity
                    onPress={handleSupport}
                    className="bg-primary/10 py-4 rounded-2xl items-center flex-row justify-center"
                    activeOpacity={0.7}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#5E2D87" />
                    <Text className="text-primary font-bold ml-2">Need Help with your order?</Text>
                </TouchableOpacity>
            </View>
        </SafeScreen>
    );
}

function LoadingUI() {
    return (
        <SafeScreen>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
                <Ionicons name="arrow-back" size={24} color="#1F2937" className="mr-4" />
                <Text className="text-xl font-bold text-text-primary">Track Order</Text>
            </View>
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#5E2D87" />
            </View>
        </SafeScreen>
    );
}

function ErrorUI() {
    return (
        <SafeScreen>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
                <Ionicons name="arrow-back" size={24} color="#1F2937" className="mr-4" />
                <Text className="text-xl font-bold text-text-primary">Track Order</Text>
            </View>
            <View className="flex-1 items-center justify-center px-6">
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text className="text-text-primary text-xl font-bold mt-4">Failed to fetch tracking data</Text>
            </View>
        </SafeScreen>
    );
}
