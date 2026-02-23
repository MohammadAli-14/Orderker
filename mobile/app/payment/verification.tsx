import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, Alert, ActivityIndicator, Platform } from "react-native";
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { useApi } from "@/lib/api";
import useCart from "@/hooks/useCart";
import { CartItem } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function PaymentVerificationScreen() {
    const router = useRouter();
    const api = useApi();
    const params = useLocalSearchParams<{
        amount: string,
        method: string,
        fullName: string,
        streetAddress: string,
        city: string,
        state: string,
        zipCode: string,
        phoneNumber: string
    }>();

    const { amount, method } = params;

    const [trxId, setTrxId] = useState("");
    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const { cart, clearCart } = useCart();
    const cartItems = cart?.items || [];

    const accountNumber = "0312 3456789";
    const accountTitle = "OrderKer Store";

    const uploadReceipt = async (uri: string): Promise<string> => {
        const formData = new FormData();
        const localUri = Platform.OS === "android" ? uri : uri.replace("file://", "");
        const filename = uri.split("/").pop() || "receipt.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // @ts-ignore
        formData.append("image", {
            uri: localUri,
            name: filename,
            type: type,
        });

        const { data } = await api.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return data.imageUrl;
    };

    const handleCopy = async () => {
        await Clipboard.setStringAsync(accountNumber);
        showToast({
            title: "Copied",
            message: "Account number copied to clipboard",
            type: "info"
        });
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
        });

        if (!result.canceled) {
            setReceiptImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!trxId || !receiptImage) {
            showToast({
                title: "Missing Information",
                message: "Please enter Transaction ID and upload a receipt.",
                type: "error"
            });
            return;
        }

        if (cartItems.length === 0) {
            showToast({
                title: "Error",
                message: "Cart is empty. Please go back and add items.",
                type: "error"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const imageUrl = await uploadReceipt(receiptImage);

            const orderData = {
                orderItems: cartItems.map((item: CartItem) => ({
                    product: item.product._id,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price,
                    image: item.product.images[0],
                })),
                shippingAddress: {
                    fullName: params.fullName,
                    streetAddress: params.streetAddress,
                    city: params.city,
                    state: params.state,
                    zipCode: params.zipCode,
                    phoneNumber: params.phoneNumber,
                },
                paymentMethod: method,
                totalPrice: Number(amount),
                paymentProof: {
                    transactionId: trxId,
                    receiptUrl: imageUrl,
                }
            };

            const { data } = await api.post("/orders", orderData);
            console.log("Order created successfully:", data.order._id);

            clearCart();

            showToast({
                title: "Order Placed!",
                message: "Your payment proof has been submitted. We will verify it shortly.",
                type: "success"
            });

            // Delay navigation slightly so the user sees the toast
            setTimeout(() => {
                router.push({
                    pathname: "/(profile)/order/[id]",
                    params: { id: data.order._id }
                });
            }, 1000);
        } catch (error: any) {
            console.error("Manual order creation error:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            showToast({
                title: "Error",
                message: error?.response?.data?.error || `Failed to create order (${error.message}). Please try again.`,
                type: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeScreen>
            <View className="flex-1 bg-background">
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-100 shadow-sm"
                    >
                        <Ionicons name="arrow-back" size={20} color="#1F2937" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-text-primary text-center flex-1 mr-10">
                        {method} Verification
                    </Text>
                </View>

                <ScrollView contentContainerStyle={{ padding: 24 }}>

                    {/* Amount Card */}
                    <View className="bg-primary/5 rounded-3xl p-6 border border-primary/10 items-center mb-6">
                        <Text className="text-primary text-xs font-bold uppercase tracking-wider mb-1">Total Payable Amount</Text>
                        <Text className="text-4xl font-extrabold text-primary">Rs. {Number(amount).toLocaleString()}</Text>

                        <View className="w-full h-px bg-primary/10 my-4" />

                        <View className="w-full flex-row justify-between items-center">
                            <View>
                                <Text className="text-text-secondary text-xs mb-1">{method} Account Number</Text>
                                <Text className="text-lg font-bold text-text-primary">{accountNumber}</Text>
                                <Text className="text-xs text-text-tertiary">{accountTitle}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleCopy}
                                className="flex-row items-center bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm"
                            >
                                <Ionicons name="copy-outline" size={16} color="#5E2D87" />
                                <Text className="text-primary text-xs font-bold ml-1">COPY</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Transaction ID Input */}
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-text-primary ml-1 mb-2">Transaction ID (TRXID)</Text>
                        <View className="relative">
                            <TextInput
                                className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-4 pr-10 text-base text-text-primary font-medium shadow-sm focus:border-primary focus:border-2"
                                placeholder="Enter transaction ID e.g. TRX993820"
                                placeholderTextColor="#9CA3AF"
                                value={trxId}
                                onChangeText={setTrxId}
                            />
                            <View className="absolute right-3 top-4">
                                <Ionicons name="receipt-outline" size={20} color="#9CA3AF" />
                            </View>
                        </View>
                    </View>

                    {/* Upload Receipt */}
                    <View className="mb-8">
                        <Text className="text-sm font-bold text-text-primary ml-1 mb-2">Upload Payment Receipt</Text>
                        <TouchableOpacity
                            onPress={pickImage}
                            activeOpacity={0.8}
                            className="w-full h-48 border-2 border-dashed border-primary/30 rounded-3xl bg-primary/5 items-center justify-center overflow-hidden"
                        >
                            {receiptImage ? (
                                <Image source={{ uri: receiptImage }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <View className="items-center">
                                    <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-2">
                                        <Ionicons name="cloud-upload-outline" size={24} color="#5E2D87" />
                                    </View>
                                    <Text className="text-sm font-bold text-primary mb-1">Tap to upload image</Text>
                                    <Text className="text-xs text-text-secondary">JPG, PNG or PDF (Max 2MB)</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-primary py-4 rounded-2xl shadow-lg shadow-primary/30 flex-row items-center justify-center mb-6"
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color="white" />
                                <Text className="text-white font-bold text-lg ml-2">Submit Proof & Complete Order</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Security Badge */}
                    <View className="flex-row items-center justify-center opacity-60">
                        <Ionicons name="lock-closed" size={14} color="#6B7280" />
                        <Text className="text-xs text-text-secondary ml-1">Secure 256-bit SSL Encrypted Payment</Text>
                    </View>

                </ScrollView>
            </View>
        </SafeScreen>
    );
}
