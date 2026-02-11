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

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 48;

const AnimatedImage = Animated.createAnimatedComponent(Image as any) as any;

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
        category: "Staples", // Real category from backend seeds
    },
    {
        id: "2",
        title: "MILK PAK",
        subtitle: "SEHAT KA KHALIS MARKA",
        badge: "FRESHNESS GUARANTEED",
        image: require("../assets/images/Milkpak.jpg"),
        gradientColors: ["rgba(0,0,0,0)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.7)"] as const,
        imageFit: "cover" as const,
        category: "Dairy & Eggs", // Real category from backend seeds
    },
    {
        id: "3",
        title: "OLPER'S MILK",
        subtitle: "KHALIS KAY RAKHWALAY",
        badge: "PREMIUM QUALITY",
        image: require("../assets/images/Olpers.jpg"),
        gradientColors: ["rgba(0,0,0,0)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.7)"] as const,
        imageFit: "cover" as const,
        category: "Dairy & Eggs", // Real category from backend seeds
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
    onPress: (category: string) => void
}) => {
    const cardStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollX.value,
            [(index - 1) * CARD_WIDTH, index * CARD_WIDTH, (index + 1) * CARD_WIDTH],
            [0.92, 1, 0.92],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ scale }],
        };
    });

    const imageSource = typeof item.image === 'string' ? { uri: item.image } : item.image;

    return (
        <Animated.View style={[styles.bannerContainer, cardStyle]}>
            <View style={styles.card}>
                {/* Full Background Image */}
                <Image
                    source={imageSource}
                    style={StyleSheet.absoluteFill}
                    contentFit={item.imageFit}
                    transition={500}
                />

                {/* Gradient Overlay for Text Readability */}
                <LinearGradient
                    colors={item.gradientColors}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* Text Overlay - Modern Design */}
                <View style={styles.textOverlay}>
                    {/* Badge */}
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title} numberOfLines={2}>
                        {item.title}
                    </Text>

                    {/* Subtitle */}
                    <Text style={styles.subtitle}>
                        {item.subtitle}
                    </Text>

                    {/* CTA Button */}
                    <TouchableOpacity
                        style={styles.button}
                        activeOpacity={0.8}
                        onPress={() => onPress(item.category)}
                    >
                        <Text style={styles.buttonText}>Shop Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

export const HeroCarousel = () => {
    const scrollX = useSharedValue(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<any>(null);
    const router = useRouter();

    const handlePress = useCallback((category: string) => {
        // Impact Light provides a premium tactile response for buttons
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Navigate to home tab with category filter
        router.push(`/(tabs)/home?category=${encodeURIComponent(category)}`);
    }, [router]);

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

            {/* Pagination dots */}
            <View style={styles.pagination}>
                {BANNERS.map((_, index) => {
                    const dotStyle = useAnimatedStyle(() => {
                        const width = interpolate(
                            scrollX.value,
                            [(index - 1) * CARD_WIDTH, index * CARD_WIDTH, (index + 1) * CARD_WIDTH],
                            [8, 28, 8],
                            Extrapolation.CLAMP
                        );
                        const opacity = interpolate(
                            scrollX.value,
                            [(index - 1) * CARD_WIDTH, index * CARD_WIDTH, (index + 1) * CARD_WIDTH],
                            [0.3, 1, 0.3],
                            Extrapolation.CLAMP
                        );
                        return { width, opacity };
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[styles.dot, dotStyle]}
                        />
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 24,
    },
    flatListContent: {
        paddingHorizontal: 24,
    },
    bannerContainer: {
        width: CARD_WIDTH,
        height: 200,
    },
    card: {
        flex: 1,
        borderRadius: 24,
        overflow: "hidden",
        position: "relative",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
        marginRight: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    textOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        zIndex: 10,
    },
    badge: {
        backgroundColor: APP_PRIMARY_PURPLE,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: "flex-start",
        marginBottom: 12,
        shadowColor: APP_PRIMARY_PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        color: "#FFFFFF",
    },
    title: {
        fontSize: 22,
        fontWeight: "900",
        lineHeight: 26,
        marginBottom: 4,
        letterSpacing: 0.3,
        color: "#FFFFFF",
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 16,
        color: "#FFFFFF",
        opacity: 0.95,
        textShadowColor: 'rgba(0, 0, 0, 0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
        letterSpacing: 0.4,
    },
    button: {
        backgroundColor: APP_PRIMARY_PURPLE,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        alignSelf: "flex-start",
        shadowColor: APP_PRIMARY_PURPLE,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: "800",
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: APP_PRIMARY_PURPLE,
    },
});
