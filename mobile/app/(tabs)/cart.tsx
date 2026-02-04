import SafeScreen from "@/components/SafeScreen";
import { useAddresses } from "@/hooks/useAddressess";
import useCart from "@/hooks/useCart";
import { useApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import OrderSummary from "@/components/OrderSummary";
import AddressSelectionModal from "@/components/AddressSelectionModal";

import * as Sentry from "@sentry/react-native";
import * as ImagePicker from "expo-image-picker";
import { Platform, TextInput } from "react-native";
import axios from "axios";

type PaymentMethod = "Stripe" | "COD" | "Easypaisa" | "JazzCash";

const CartScreen = () => {
  const api = useApi();
  const {
    cart,
    cartItemCount,
    cartTotal,
    clearCart,
    isError,
    isLoading,
    isRemoving,
    isUpdating,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const { addresses } = useAddresses();

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Stripe");
  const [transactionId, setTransactionId] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

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

  const uploadReceipt = async (uri: string): Promise<string> => {
    const formData = new FormData();

    // Normalize URI for Android/iOS
    const localUri = Platform.OS === "android" ? uri : uri.replace("file://", "");
    const filename = uri.split("/").pop() || "receipt.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    // @ts-ignore
    formData.append("image", {
      uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
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

  const cartItems = cart?.items || [];
  const subtotal = cartTotal;
  const shipping = 150; // Rs. 150 shipping fee for Karachi
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    updateQuantity({ productId, quantity: newQuantity });
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert("Remove Item", `Remove ${productName} from cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromCart(productId),
      },
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // check if user has addresses
    if (!addresses || addresses.length === 0) {
      Alert.alert(
        "No Address",
        "Please add a shipping address in your profile before checking out.",
        [{ text: "OK" }]
      );
      return;
    }

    // show address selection modal
    setAddressModalVisible(true);
  };

  const handleProceedWithPayment = async (selectedAddress: Address) => {
    setAddressModalVisible(false);

    // Validate Manual Payment
    if (["Easypaisa", "JazzCash"].includes(paymentMethod)) {
      if (!transactionId) {
        Alert.alert("Error", "Please enter the Transaction ID");
        return;
      }
      if (!receiptImage) {
        Alert.alert("Error", "Please upload the payment receipt");
        return;
      }
    }

    // log chechkout initiated
    Sentry.logger.info("Checkout initiated", {
      itemCount: cartItemCount,
      total: total.toFixed(2),
      city: selectedAddress.city,
      paymentMethod,
    });

    try {
      setPaymentLoading(true);

      if (paymentMethod === "Stripe") {
        // create payment intent with cart items and shipping address
        const { data } = await api.post("/payment/create-intent", {
          cartItems,
          shippingAddress: {
            fullName: selectedAddress.fullName,
            streetAddress: selectedAddress.streetAddress,
            city: selectedAddress.city,
            state: selectedAddress.state,
            zipCode: selectedAddress.zipCode,
            phoneNumber: selectedAddress.phoneNumber,
          },
        });

        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: data.clientSecret,
          merchantDisplayName: "OrderKer Store",
        });

        if (initError) {
          Alert.alert("Error", initError.message);
          setPaymentLoading(false);
          return;
        }

        // present payment sheet
        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
          Alert.alert("Payment cancelled", presentError.message);
          return; // Stop execution
        }

        // Success handled by webhook mostly, but we clear cart here
        Alert.alert("Success", "Your payment was successful!", [{ text: "OK" }]);
        clearCart();
        return;
      }

      // Handle COD and Manual Payments
      let paymentProof = null;
      if (["Easypaisa", "JazzCash"].includes(paymentMethod) && receiptImage) {
        const imageUrl = await uploadReceipt(receiptImage);
        paymentProof = {
          transactionId,
          receiptUrl: imageUrl,
        };
      }

      // Create Order Directly
      await api.post("/orders", {
        orderItems: cartItems.map((item) => ({
          product: item.product._id, // backend expects product ID string
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.images[0],
        })),
        shippingAddress: {
          fullName: selectedAddress.fullName,
          streetAddress: selectedAddress.streetAddress,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          phoneNumber: selectedAddress.phoneNumber,
        },
        paymentMethod,
        paymentProof,
        totalPrice: total,
      });

      Alert.alert("Success", "Your order has been placed successfully!", [
        { text: "OK", onPress: () => { } },
      ]);
      clearCart();
      setTransactionId("");
      setReceiptImage(null);

    } catch (error) {
      Sentry.logger.error("Order failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        cartTotal: total,
        paymentMethod,
      });

      let msg = "Failed to place order";
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        msg = error.message;
      }

      Alert.alert("Error", msg);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (isLoading) return <LoadingUI />;
  if (isError) return <ErrorUI />;
  if (cartItems.length === 0) return <EmptyUI />;

  return (
    <SafeScreen>
      <Text className="px-6 pb-5 text-text-primary text-3xl font-bold tracking-tight">Cart</Text>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 240 }}
      >
        <View className="px-6 gap-2">
          {cartItems.map((item, index) => (
            <View key={item._id} className="bg-surface rounded-3xl overflow-hidden ">
              <View className="p-4 flex-row">
                {/* product image */}
                <View className="relative">
                  <Image
                    source={item.product.images[0]}
                    className="bg-background-lighter"
                    contentFit="cover"
                    style={{ width: 112, height: 112, borderRadius: 16 }}
                  />
                  <View className="absolute top-2 right-2 bg-primary rounded-full px-2 py-0.5">
                    <Text className="text-background text-xs font-bold">×{item.quantity}</Text>
                  </View>
                </View>

                <View className="flex-1 ml-4 justify-between">
                  <View>
                    <Text
                      className="text-text-primary font-bold text-lg leading-tight"
                      numberOfLines={2}
                    >
                      {item.product.name}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Text className="text-primary font-bold text-2xl">
                        {formatCurrency(item.product.price * item.quantity)}
                      </Text>
                      <Text className="text-text-secondary text-sm ml-2">
                        {formatCurrency(item.product.price)} each
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mt-3">
                    <TouchableOpacity
                      className="bg-background-lighter rounded-full w-9 h-9 items-center justify-center"
                      activeOpacity={0.7}
                      onPress={() => handleQuantityChange(item.product._id, item.quantity, -1)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="remove" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>

                    <View className="mx-4 min-w-[32px] items-center">
                      <Text className="text-text-primary font-bold text-lg">{item.quantity}</Text>
                    </View>

                    <TouchableOpacity
                      className="bg-primary rounded-full w-9 h-9 items-center justify-center"
                      activeOpacity={0.7}
                      onPress={() => handleQuantityChange(item.product._id, item.quantity, 1)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#121212" />
                      ) : (
                        <Ionicons name="add" size={18} color="#121212" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="ml-auto bg-red-500/10 rounded-full w-9 h-9 items-center justify-center"
                      activeOpacity={0.7}
                      onPress={() => handleRemoveItem(item.product._id, item.product.name)}
                      disabled={isRemoving}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Selection */}
        <View className="px-6 mt-6">
          <Text className="text-text-primary text-xl font-bold mb-4">Payment Method</Text>
          <View className="gap-3">
            {(["Stripe", "COD", "Easypaisa", "JazzCash"] as PaymentMethod[]).map((method) => (
              <TouchableOpacity
                key={method}
                className={`p-4 rounded-2xl border ${paymentMethod === method
                  ? "bg-primary/10 border-primary"
                  : "bg-surface border-transparent"
                  }`}
                onPress={() => setPaymentMethod(method)}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`font-semibold text-lg ${paymentMethod === method ? "text-primary" : "text-text-primary"
                      }`}
                  >
                    {method === "Stripe" ? "Credit/Debit Card" : method}
                  </Text>
                  {paymentMethod === method && (
                    <Ionicons name="checkmark-circle" size={24} color="#1DB954" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Manual Payment Inputs */}
          {["Easypaisa", "JazzCash"].includes(paymentMethod) && (
            <View className="mt-4 p-4 bg-surface rounded-2xl">
              <Text className="text-text-secondary mb-2">Transaction Details</Text>

              <Text className="text-text-secondary text-sm mb-2 opacity-70">
                Please send amount to 0300-1234567 and upload proof.
              </Text>

              <TextInput
                className="bg-background p-4 rounded-xl text-text-primary mb-3"
                placeholder="Enter Transaction ID"
                placeholderTextColor="#666"
                value={transactionId}
                onChangeText={setTransactionId}
              />

              <TouchableOpacity
                className="bg-background p-4 rounded-xl flex-row items-center justify-center border border-dashed border-gray-600"
                onPress={pickImage}
              >
                {receiptImage ? (
                  <Image
                    source={{ uri: receiptImage }}
                    style={{ width: "100%", height: 150, borderRadius: 8 }}
                    contentFit="cover"
                  />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={24} color="#666" />
                    <Text className="text-text-secondary ml-2">Upload Receipt</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <OrderSummary subtotal={subtotal} shipping={shipping} tax={tax} total={total} />
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t
       border-surface pt-4 pb-32 px-6"
      >
        {/* Quick Stats */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Ionicons name="cart" size={20} color="#1DB954" />
            <Text className="text-text-secondary ml-2">
              {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-text-primary font-bold text-xl">{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          className="bg-primary rounded-2xl overflow-hidden"
          activeOpacity={0.9}
          onPress={handleCheckout}
          disabled={paymentLoading}
        >
          <View className="py-5 flex-row items-center justify-center">
            {paymentLoading ? (
              <ActivityIndicator size="small" color="#121212" />
            ) : (
              <>
                <Text className="text-background font-bold text-lg mr-2">Checkout</Text>
                <Ionicons name="arrow-forward" size={20} color="#121212" />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <AddressSelectionModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onProceed={handleProceedWithPayment}
        isProcessing={paymentLoading}
      />
    </SafeScreen>
  );
};

export default CartScreen;

function LoadingUI() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#00D9FF" />
      <Text className="text-text-secondary mt-4">Loading cart...</Text>
    </View>
  );
}

function ErrorUI() {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
      <Text className="text-text-primary font-semibold text-xl mt-4">Failed to load cart</Text>
      <Text className="text-text-secondary text-center mt-2">
        Please check your connection and try again
      </Text>
    </View>
  );
}

function EmptyUI() {
  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-5">
        <Text className="text-text-primary text-3xl font-bold tracking-tight">Cart</Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="cart-outline" size={80} color="#666" />
        <Text className="text-text-primary font-semibold text-xl mt-4">Your cart is empty</Text>
        <Text className="text-text-secondary text-center mt-2">
          Add some products to get started
        </Text>
      </View>
    </View>
  );
}
