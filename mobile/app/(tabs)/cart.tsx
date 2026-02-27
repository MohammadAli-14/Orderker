import SafeScreen from "@/components/SafeScreen";
import { useAddresses } from "@/hooks/useAddressess";
import useCart from "@/hooks/useCart";
import { useApi } from "@/lib/api";
import { calculateFinalPrice, formatCurrency } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View, TextInput, Platform, Image as RNImage, FlatList } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useState, useCallback, useMemo } from "react";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import OrderSummary from "@/components/OrderSummary";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import { PrimaryButton } from "@/components/PrimaryButton"; // Updated import
import { CartItemSkeleton } from "@/components/Skeleton";
import { ConfirmModal } from "@/components/ConfirmModal";

import { useProfile } from "@/hooks/useProfile";
import * as Sentry from "@sentry/react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { router } from "expo-router";
import PhoneVerificationModal from "@/components/PhoneVerificationModal";
import { useUser } from "@clerk/clerk-expo";

type PaymentMethod = "Stripe" | "COD" | "Easypaisa" | "JazzCash";

const CartScreen = () => {
  const api = useApi();
  const { user } = useUser();
  const { profile, isLoading: isProfileLoading } = useProfile();

  const {
    cart,
    cartItemCount,
    cartTotal,
    clearCart,
    isError,
    isLoading,
    isRemoving,
    isClearing,
    isUpdating,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const { addresses } = useAddresses();

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [clearCartVisible, setClearCartVisible] = useState(false);
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ id: string; name: string } | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const { showToast } = useToast();

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((sum, item) => {
    const price = calculateFinalPrice(item.product.price, item.product.isFlashSale, item.product.discountPercent);
    return sum + (price * item.quantity);
  }, 0);
  const shipping = 150;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = useCallback((productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    updateQuantity({ productId, quantity: newQuantity });
  }, [updateQuantity]);

  const handleRemoveItem = useCallback((productId: string, productName: string) => {
    setItemToRemove({ id: productId, name: productName });
    setRemoveModalVisible(true);
  }, []);

  const handleClearCart = useCallback(() => {
    setClearCartVisible(true);
  }, []);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // Use backend profile truth, completely ignoring empty Clerk publicMetadata
    const isVerified = profile?.isPhoneVerified === true;

    if (!isVerified) {
      setVerificationModalVisible(true);
      return;
    }

    if (!addresses || addresses.length === 0) {
      showToast({
        title: "No Address",
        message: "Please add a shipping address in your profile before checking out.",
        type: "info"
      });
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
          showToast({
            title: "Error",
            message: initError.message,
            type: "error"
          });
          setPaymentLoading(false);
          return;
        }

        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
          showToast({
            title: "Payment cancelled",
            message: presentError.message,
            type: "info"
          });
          return;
        }

        showToast({
          title: "Success",
          message: "Your payment was successful!",
          type: "success"
        });
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

      showToast({
        title: "Success",
        message: "Your order has been placed successfully!",
        type: "success"
      });
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

      showToast({
        title: "Error",
        message: msg,
        type: "error"
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => (
    <View key={item._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row mb-4">
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
          <View>
            <Text className="text-primary font-bold text-lg">
              Rs. {calculateFinalPrice(item.product.price, item.product.isFlashSale, item.product.discountPercent) * item.quantity}
            </Text>
            {item.product.isFlashSale && (
              <Text className="text-text-secondary text-xs line-through">
                Rs. {item.product.price * item.quantity}
              </Text>
            )}
          </View>

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
  ), [handleRemoveItem, handleQuantityChange, isUpdating]);

  const ListHeader = useMemo(() => (
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
        <Ionicons name="trash-outline" size={24} color="#5E2D87" />
      </TouchableOpacity>
    </View>
  ), [handleClearCart]);

  const ListFooter = useMemo(() => (
    <View>
      {/* Payment Method */}
      <View className="px-6 mt-8">
        <Text className="text-text-primary text-lg font-bold mb-4">Payment Method</Text>
        <View className="flex-row flex-wrap justify-between">
          {(["COD", "Easypaisa", "JazzCash"] as PaymentMethod[]).map((method) => (
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
      </View>

      <OrderSummary subtotal={subtotal} shipping={shipping} tax={tax} total={total} />
    </View>
  ), [paymentMethod, subtotal, shipping, tax, total]);

  if (isLoading) return <LoadingUI />;
  if (isError) return <ErrorUI />;
  if (cartItems.length === 0) return <EmptyUI />;


  return (
    <SafeScreen>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={{ paddingBottom: 240 }}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-white"
      />

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

      {/* Remove Item Confirmation */}
      <ConfirmModal
        visible={removeModalVisible}
        onClose={() => setRemoveModalVisible(false)}
        onConfirm={() => {
          if (itemToRemove) {
            removeFromCart(itemToRemove.id, {
              onSuccess: () => {
                setRemoveModalVisible(false);
                showToast({
                  title: "Removed",
                  message: `${itemToRemove.name} removed from cart`,
                  type: "success"
                });
              }
            });
          }
        }}
        title="Remove Item"
        message={`Are you sure you want to remove ${itemToRemove?.name} from your cart?`}
        confirmLabel="Remove"
        isDestructive={true}
        loading={isRemoving}
      />

      {/* Clear Cart Confirmation */}
      <ConfirmModal
        visible={clearCartVisible}
        onClose={() => setClearCartVisible(false)}
        onConfirm={() => {
          clearCart(undefined, {
            onSuccess: () => {
              setClearCartVisible(false);
              showToast({
                title: "Cart Cleared",
                message: "All items removed from your cart",
                type: "success"
              });
            }
          });
        }}
        title="Clear Cart"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmLabel="Clear All"
        isDestructive={true}
        loading={isClearing}
      />
      <PhoneVerificationModal
        visible={verificationModalVisible}
        onVerified={() => {
          setVerificationModalVisible(false);
          setAddressModalVisible(true);
        }}
        onDismiss={() => setVerificationModalVisible(false)}
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
      <Ionicons name="alert-circle-outline" size={64} color="#5E2D87" />
      <Text className="text-text-primary font-semibold text-xl mt-4">Failed to load cart</Text>
    </View>
  );
}

function EmptyUI() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleStartShopping = () => {
    setIsRedirecting(true);
    // Add a small delay for the ripple effect/interaction to be felt
    setTimeout(() => {
      router.push("/(tabs)/home");
      // Reset state after navigation (though component might unmount)
      setIsRedirecting(false);
    }, 500);
  };

  return (
    <SafeScreen>
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Cart</Text>
        <View className="bg-primary/10 px-3 py-1 rounded-full">
          <Text className="text-primary text-xs font-bold">0 items</Text>
        </View>
      </View>

      <View className="flex-1 items-center justify-center py-20 bg-white px-6">
        <View className="w-32 h-32 bg-primary/5 rounded-full items-center justify-center mb-8 border border-primary/10 shadow-sm">
          <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center">
            <Ionicons name="cart-outline" size={48} color="#5E2D87" />
          </View>
        </View>
        <Text className="text-3xl font-bold text-text-primary mb-3 text-center">Your Cart is Empty</Text>
        <Text className="text-text-secondary text-center px-8 leading-6 text-base mb-10">
          Looks like you haven't added anything to your cart yet. Go ahead and explore our top categories.
        </Text>

        <TouchableOpacity
          onPress={handleStartShopping}
          disabled={isRedirecting}
          className={`px-12 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20 ${isRedirecting ? "bg-primary/70" : "bg-primary"
            }`}
          activeOpacity={0.8}
        >
          {isRedirecting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-lg mr-2">Start Shopping</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}
