import SafeScreen from "@/components/SafeScreen";
import { useAddresses } from "@/hooks/useAddressess";
import useCart from "@/hooks/useCart";
import { useApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View, TextInput, Platform, Image as RNImage } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import OrderSummary from "@/components/OrderSummary";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import { PrimaryButton } from "@/components/PrimaryButton"; // Updated import
import { CartItemSkeleton } from "@/components/Skeleton";

import * as Sentry from "@sentry/react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { router } from "expo-router";

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

  const cartItems = cart?.items || [];
  const subtotal = cartTotal;
  const shipping = 150;
  const tax = subtotal * 0.05;
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

  const handleClearCart = () => {
    Alert.alert("Clear Cart", "Are you sure you want to remove all items from your cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: () => clearCart(),
      },
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    if (!addresses || addresses.length === 0) {
      Alert.alert(
        "No Address",
        "Please add a shipping address in your profile before checking out.",
        [{ text: "OK" }]
      );
      return;
    }
    setAddressModalVisible(true);
  };

  const handleProceedWithPayment = async (selectedAddress: Address) => {
    setAddressModalVisible(false);

    if (["Easypaisa", "JazzCash"].includes(paymentMethod)) {
      router.push({
        pathname: "/payment/verification",
        params: {
          amount: total.toString(),
          method: paymentMethod,
          fullName: selectedAddress.fullName,
          streetAddress: selectedAddress.streetAddress,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          phoneNumber: selectedAddress.phoneNumber,
        }
      });
      return;
    }

    Sentry.logger.info("Checkout initiated", {
      itemCount: cartItemCount,
      total: total.toFixed(2),
      city: selectedAddress.city,
      paymentMethod,
    });

    try {
      setPaymentLoading(true);

      if (paymentMethod === "Stripe") {
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

        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
          Alert.alert("Payment cancelled", presentError.message);
          return;
        }

        Alert.alert("Success", "Your payment was successful!", [{ text: "OK" }]);
        clearCart();
        return;
      }

      // Handle COD
      await api.post("/orders", {
        orderItems: cartItems.map((item) => ({
          product: item.product._id,
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
        totalPrice: total,
      });

      Alert.alert("Success", "Your order has been placed successfully!", [
        { text: "OK", onPress: () => { } },
      ]);
      clearCart();

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
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-center relative">
        <TouchableOpacity
          style={{ position: 'absolute', left: 24, zIndex: 10 }}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Shopping Cart</Text>
        <TouchableOpacity
          style={{ position: 'absolute', right: 24 }}
          onPress={handleClearCart}
        >
          <Ionicons name="trash-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 240 }}
      >
        <View className="px-6 gap-4 mt-4">
          {cartItems.map((item) => (
            <View key={item._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row">
              {/* Image */}
              <View className="bg-surface rounded-xl p-2 items-center justify-center h-20 w-20">
                <Image
                  source={item.product.images[0]}
                  style={{ width: 60, height: 60 }}
                  contentFit="contain"
                />
              </View>

              {/* Details */}
              <View className="flex-1 ml-4 justify-between">
                <View className="flex-row items-center justify-between">
                  <Text className="text-text-primary font-bold text-base flex-1" numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(item.product._id, item.product.name)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                <Text className="text-text-secondary text-xs mt-1">
                  1 unit {/* Placeholder unit */}
                </Text>

                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-primary font-bold text-lg">
                    Rs. {item.product.price * item.quantity}
                  </Text>

                  {/* Quantity Control */}
                  <View className="flex-row items-center bg-surface rounded-lg">
                    <TouchableOpacity
                      onPress={() => handleQuantityChange(item.product._id, item.quantity, -1)}
                      className="p-2 w-10 h-10 items-center justify-center"
                      disabled={isUpdating || item.quantity <= 1}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#5E2D87" />
                      ) : (
                        <Ionicons
                          name="remove"
                          size={16}
                          color={item.quantity <= 1 ? "#D1D5DB" : "#1F2937"}
                        />
                      )}
                    </TouchableOpacity>

                    <Text className="text-text-primary font-semibold mx-2">{item.quantity}</Text>

                    <TouchableOpacity
                      onPress={() => handleQuantityChange(item.product._id, item.quantity, 1)}
                      className="p-2 w-10 h-10 items-center justify-center"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#5E2D87" />
                      ) : (
                        <Ionicons name="add" size={16} color="#1F2937" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Method */}
        <View className="px-6 mt-8">
          <Text className="text-text-primary text-lg font-bold mb-4">Payment Method</Text>
          <View className="flex-row flex-wrap justify-between">
            {(["Stripe", "COD", "Easypaisa", "JazzCash"] as PaymentMethod[]).map((method) => (
              <TouchableOpacity
                key={method}
                className={`w-[48%] p-4 rounded-2xl border mb-4 items-center justify-center ${paymentMethod === method
                  ? "bg-white border-primary"
                  : "bg-white border-gray-200"
                  }`}
                onPress={() => setPaymentMethod(method)}
              >
                <Ionicons
                  name={method === "Stripe" ? "card-outline" : "cash-outline"}
                  size={24}
                  color={paymentMethod === method ? "#5E2D87" : "#6B7280"}
                />
                <Text className={`mt-2 font-medium ${paymentMethod === method ? "text-primary" : "text-text-secondary"}`}>
                  {method === "Stripe" ? "Card" : method}
                </Text>
                {paymentMethod === method && (
                  <View className="absolute top-2 right-2">
                    <Ionicons name="checkmark-circle" size={16} color="#5E2D87" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Manual Payment Inputs Removed - Redirecting to Verification Screen instead */}

        </View>

        <OrderSummary subtotal={subtotal} shipping={shipping} tax={tax} total={total} />
      </ScrollView>

      {/* Footer */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 pt-4 pb-8 px-6 rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
      >
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text-secondary text-base">Total</Text>
          <Text className="text-text-primary font-bold text-2xl">Rs. {total.toLocaleString()}</Text>
        </View>

        <PrimaryButton
          title={`Checkout - Rs. ${total.toLocaleString()}`}
          onPress={handleCheckout}
          loading={paymentLoading}
          disabled={paymentLoading}
        />
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

// Keep existing LoadingUI, ErrorUI, EmptyUI but update their styling if needed to match white theme
function LoadingUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#5E2D87" />
      </View>
    </SafeScreen>
  );
}

function ErrorUI() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text className="text-text-primary font-semibold text-xl mt-4">Failed to load cart</Text>
    </View>
  );
}

function EmptyUI() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <View className="w-24 h-24 bg-surface rounded-full items-center justify-center mb-6">
        <Ionicons name="cart-outline" size={40} color="#9CA3AF" />
      </View>
      <Text className="text-text-primary font-bold text-xl">Your cart is empty</Text>
      <Text className="text-text-secondary text-center mt-2 mb-8">
        Add some products to get started
      </Text>

      {/* We can add a "Start Shopping" button here later */}
    </View>
  );
}
