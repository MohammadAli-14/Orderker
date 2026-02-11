import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    SafeAreaView,
    Dimensions,
    StatusBar,
    Animated,
    StyleSheet,
} from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { SecondaryButton } from "../components/SecondaryButton";
import { Ionicons } from "@expo/vector-icons";
import useSocialAuth from "@/hooks/useSocialAuth";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
    const { isSignedIn, isLoaded } = useAuth();
    const { loadingStrategy, handleSocialAuth } = useSocialAuth();

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const heroScale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (isLoaded) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(heroScale, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isLoaded]);

    if (!isLoaded) return null;

    if (isSignedIn) {
        return <Redirect href={"/(tabs)/home"} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Background Accent */}
            <View style={styles.bgAccent} />

            <Animated.View
                style={[
                    styles.mainContent,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
            >
                {/* ==========================================
                    1. LOGO BADGE (OVERLAPPING TYPE)
                    ========================================== */}
                <View style={styles.logoWrapper}>
                    <View style={styles.logoBadge}>
                        <Image
                            source={require("@/assets/images/orderker-logo-full.png")}
                            style={styles.logoImage}
                            contentFit="contain"
                        />
                    </View>
                </View>

                {/* ==========================================
                    2. HERO COMPONENT (THE CENTERPIECE)
                    ========================================== */}
                <Animated.View
                    style={[
                        styles.heroContainer,
                        { transform: [{ scale: heroScale }] }
                    ]}
                >
                    <View style={styles.heroCard}>
                        <Image
                            source={require("@/assets/images/welcome-hero.jpg")}
                            style={styles.heroImage}
                            contentFit="cover"
                        />
                        <LinearGradient
                            colors={["transparent", "rgba(94, 45, 135, 0.45)"]}
                            style={styles.heroGradient}
                        />
                        <View style={styles.heroBadge}>
                            <View style={styles.heroTag}>
                                <Text style={styles.heroTagText}>⚡ SUPERFAST</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* ==========================================
                    3. ACTION CLUSTER (TITLE + BUTTONS)
                    ========================================== */}
                <View style={styles.actionCluster}>
                    <View style={styles.textGroup}>
                        <Text style={styles.title}>
                            Welcome to <Text style={styles.titleHighlight}>Orderker</Text>
                        </Text>
                        <Text style={styles.subtitle}>
                            Pakistan's fastest grocery delivery.{"\n"}Fresh products at your doorstep.
                        </Text>
                    </View>

                    {/* Auth Buttons Group */}
                    <View style={styles.buttonGroup}>
                        <SecondaryButton
                            title={loadingStrategy === "oauth_google" ? "Signing in..." : "Continue with Google"}
                            onPress={() => handleSocialAuth("oauth_google")}
                            icon={<Ionicons name="logo-google" size={18} color="#4B5563" />}
                            disabled={loadingStrategy !== null}
                            textClassName="text-sm font-bold text-gray-700"
                            className="bg-white border-gray-100 py-4 rounded-3xl shadow-sm border"
                        />

                        <SecondaryButton
                            title={loadingStrategy === "oauth_apple" ? "Signing in..." : "Continue with Apple"}
                            onPress={() => handleSocialAuth("oauth_apple")}
                            icon={<Ionicons name="logo-apple" size={20} color="#111827" />}
                            disabled={loadingStrategy !== null}
                            textClassName="text-sm font-bold text-gray-700"
                            className="bg-white border-gray-100 py-4 rounded-3xl shadow-sm border"
                        />
                    </View>

                    {/* Compact Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            By continuing you agree to our{" "}
                            <Text style={styles.footerLink}>Terms</Text> &{" "}
                            <Text style={styles.footerLink}>Privacy Policy</Text>
                        </Text>
                    </View>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    bgAccent: {
        position: "absolute",
        top: -height * 0.1,
        right: -width * 0.2,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: "#F3E8FF",
        opacity: 0.5,
    },
    mainContent: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 28,
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
        paddingBottom: 24,
    },
    logoWrapper: {
        alignItems: "center",
        zIndex: 10,
    },
    logoBadge: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        paddingHorizontal: 20,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
    },
    logoImage: {
        width: 140,
        height: 42,
    },
    heroContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 20,
    },
    heroCard: {
        width: width * 0.75,
        aspectRatio: 1,
        maxHeight: 300,
        maxWidth: 300,
        borderRadius: 40,
        backgroundColor: "#F9FAFB",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 12,
    },
    heroImage: {
        width: "100%",
        height: "100%",
    },
    heroGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "40%",
    },
    heroBadge: {
        position: "absolute",
        bottom: 20,
        right: 20,
    },
    heroTag: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        shadowColor: "#000",
        shadowRadius: 4,
        shadowOpacity: 0.1,
    },
    heroTagText: {
        fontSize: 10,
        fontWeight: "900",
        color: "#5E2D87",
    },
    actionCluster: {
        backgroundColor: "#FFF",
        borderRadius: 36,
        paddingVertical: 10,
    },
    textGroup: {
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 30,
        fontWeight: "900",
        color: "#111827",
        textAlign: "center",
        marginBottom: 8,
        letterSpacing: -0.8,
    },
    titleHighlight: {
        color: "#5E2D87",
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
        fontWeight: "500",
    },
    buttonGroup: {
        gap: 12,
        marginBottom: 20,
    },
    footerStatus: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    footer: {
        alignItems: "center",
    },
    footerText: {
        fontSize: 11,
        color: "#9CA3AF",
        textAlign: "center",
        lineHeight: 16,
    },
    footerLink: {
        color: "#5E2D87",
        fontWeight: "700",
    },
});
