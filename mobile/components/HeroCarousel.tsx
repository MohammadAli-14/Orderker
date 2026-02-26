import React, { useCallback, useRef, useEffect, useState } from "react";
import {
    View,
    Text,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    SharedValue,
} from "react-native-reanimated";

import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import useProducts from "@/hooks/useProducts";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width; // Full width for hero slider

const APP_PRIMARY_PURPLE = "#5E2D87";

const BANNERS = [
    {
        id: "1",
        title: "DALDA COOKING OIL",
        subtitle: "ZAIQAY SE GHIZA IJAT TAK",
        badge: "FLAT 10% OFF",
        image: require("../assets/images/Dalda.jpg"),
        gradientColors: ["rgba(0,0,0,0)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.7)"] as const,
        imageFit: "cover" as const,
        searchTerm: "Dalda",
    },
    {
        id: "2",
        title: "MILK PAK",
        subtitle: "SEHAT KA KHALIS MARKA",
        badge: "FRESHNESS GUARANTEED",
        image: require("../assets/images/Milkpak.jpg"),
        gradientColors: ["rgba(0,0,0,0)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.7)"] as const,
        imageFit: "cover" as const,
        searchTerm: "Milk Pak",
    },
    {
        id: "3",
        title: "OLPER'S MILK",
        subtitle: "KHALIS KAY RAKHWALAY",
        badge: "PREMIUM QUALITY",
        image: require("../assets/images/Olpers.jpg"),
        gradientColors: ["rgba(0,0,0,0)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.7)"] as const,
        imageFit: "cover" as const,
        searchTerm: "Olper",
    },
];

const CarouselCard = ({
    item,
    index,
    scrollX,
    onPress
}: {
    item: typeof BANNERS[0],
    index: number,
    scrollX: SharedValue<number>,
    onPress: (searchTerm: string) => void
}) => {
    const cardStyle = useAnimatedStyle(() => {
        return { transform: [{ scale: 1 }] };
    });

    const imageSource = typeof item.image === 'string' ? { uri: item.image } : item.image;

    return (
        <Animated.View style={[styles.bannerContainer, cardStyle]}>
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => onPress(item.searchTerm)}
            >
                {/* Full Background Image */}
                <Image
                    source={imageSource}
                    style={StyleSheet.absoluteFill}
                    contentFit={item.imageFit}
                    transition={500}
                />

                {/* Gradient Overlay */}
                <LinearGradient
                    colors={item.gradientColors}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* Text Overlay */}
                <View style={styles.textOverlay}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                    <Text style={styles.title} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={styles.subtitle}>
                        {item.subtitle}
                    </Text>
                    {/* Shop Now button REMOVED as per client request */}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export const HeroCarousel = () => {
    const scrollX = useSharedValue(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<any>(null);
    const router = useRouter();
    const { data: apiProducts = [] } = useProducts();

    const handlePress = useCallback((searchTerm: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        let match = null;
        if (apiProducts && apiProducts.length > 0) {
            // Try a flexible name match
            match = apiProducts.find((p) => {
                const pName = p.name ? p.name.toLowerCase() : "";
                const term = searchTerm.toLowerCase();
                return pName.includes(term);
            });
        }

        if (match) {
            router.push(`/product/${match._id}` as any);
        } else {
            router.push(`/(tabs)/search?q=${encodeURIComponent(searchTerm)}` as any);
        }
    }, [router, apiProducts]);

    // Auto-scroll logic
    useEffect(() => {
        const timer = setInterval(() => {
            let nextIndex = activeIndex + 1;
            if (nextIndex >= BANNERS.length) {
                nextIndex = 0;
            }
            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });
            setActiveIndex(nextIndex);
        }, 5000);

        return () => clearInterval(timer);
    }, [activeIndex]);

    const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
        setActiveIndex(index);
    };

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const renderItem = useCallback(({ item, index }: { item: typeof BANNERS[0], index: number }) => (
        <CarouselCard
            item={item}
            index={index}
            scrollX={scrollX}
            onPress={handlePress}
        />
    ), [scrollX, handlePress]);

    return (
        <View style={styles.container}>
            <Animated.FlatList
                ref={flatListRef}
                data={BANNERS}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onScroll={onScroll}
                onMomentumScrollEnd={onMomentumScrollEnd}
                scrollEventThrottle={16}
                snapToInterval={CARD_WIDTH}
                decelerationRate="fast"
                contentContainerStyle={styles.flatListContent}
            />
            {/* Pagination dots REMOVED as per client request */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    flatListContent: {
        paddingHorizontal: 0,
    },
    bannerContainer: {
        width: width,
        height: 180,
    },
    card: {
        flex: 1,
        borderRadius: 0,
        overflow: "hidden",
        position: "relative",
    },
    textOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        zIndex: 10,
    },
    badge: {
        backgroundColor: APP_PRIMARY_PURPLE,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: "flex-start",
        marginBottom: 8,
        shadowColor: APP_PRIMARY_PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: "900",
        letterSpacing: 0.6,
        textTransform: "uppercase",
        color: "#FFFFFF",
    },
    title: {
        fontSize: 18,
        fontWeight: "900",
        lineHeight: 22,
        marginBottom: 2,
        letterSpacing: 0.2,
        color: "#FFFFFF",
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    subtitle: {
        fontSize: 11,
        fontWeight: "700",
        marginBottom: 4,
        color: "#FFFFFF",
        opacity: 0.95,
        textShadowColor: 'rgba(0, 0, 0, 0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
        letterSpacing: 0.3,
    },
});