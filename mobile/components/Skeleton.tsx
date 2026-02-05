import { View, DimensionValue } from "react-native";
import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

interface SkeletonProps {
    width?: DimensionValue;
    height?: number;
    borderRadius?: number;
    className?: string;
}

const Skeleton = ({ width = "100%", height = 16, borderRadius = 8, className = "" }: SkeletonProps) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [opacity]);

    return (
        <Animated.View
            className={`bg-surface-light ${className}`}
            style={{
                width,
                height,
                borderRadius,
                opacity,
            }}
        />
    );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => (
    <View className="bg-surface rounded-3xl overflow-hidden mb-3" style={{ width: "48%" }}>
        <Skeleton width="100%" height={176} borderRadius={0} />
        <View className="p-3">
            <Skeleton width={60} height={12} className="mb-2" />
            <Skeleton width="100%" height={16} className="mb-2" />
            <Skeleton width="75%" height={16} className="mb-3" />
            <View className="flex-row items-center justify-between">
                <Skeleton width={80} height={20} />
                <Skeleton width={32} height={32} borderRadius={16} />
            </View>
        </View>
    </View>
);

// Cart Item Skeleton
export const CartItemSkeleton = () => (
    <View className="bg-surface rounded-3xl overflow-hidden mb-3 p-4 flex-row">
        <Skeleton width={112} height={112} borderRadius={16} />
        <View className="flex-1 ml-4 justify-between">
            <View>
                <Skeleton width="90%" height={18} className="mb-2" />
                <Skeleton width={100} height={24} className="mb-2" />
            </View>
            <View className="flex-row items-center">
                <Skeleton width={36} height={36} borderRadius={18} />
                <Skeleton width={32} height={20} className="mx-4" />
                <Skeleton width={36} height={36} borderRadius={18} />
            </View>
        </View>
    </View>
);

// Wishlist Item Skeleton
export const WishlistItemSkeleton = () => (
    <View className="bg-surface rounded-3xl overflow-hidden mb-3 p-4 flex-row">
        <Skeleton width={96} height={96} borderRadius={8} />
        <View className="flex-1 ml-4">
            <Skeleton width="80%" height={16} className="mb-2" />
            <Skeleton width={80} height={20} className="mb-2" />
            <Skeleton width={60} height={14} />
        </View>
    </View>
);

// Order Card Skeleton
export const OrderCardSkeleton = () => (
    <View className="bg-surface rounded-3xl overflow-hidden mb-3 p-4">
        <View className="flex-row justify-between mb-3">
            <Skeleton width={100} height={14} />
            <Skeleton width={80} height={24} borderRadius={12} />
        </View>
        <Skeleton width="60%" height={16} className="mb-2" />
        <Skeleton width={100} height={20} />
    </View>
);

export default Skeleton;
