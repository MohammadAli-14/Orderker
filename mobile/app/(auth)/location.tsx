import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Animated,
    StyleSheet,
    StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@clerk/clerk-expo";

export default function LocationScreen() {
    const router = useRouter();
    const { userId } = useAuth();
    const [zone, setZone] = useState("Malir");
    const [area, setArea] = useState("");

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleContinue = async () => {
        try {
            // Mark onboarding as completed
            if (userId) {
                await AsyncStorage.setItem(`onboarding_${userId}`, "true");
            }
            router.replace("/(tabs)/home");
        } catch (error) {
            console.error("Error saving onboarding status:", error);
            // Still navigate even if save fails
            router.replace("/(tabs)/home");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <Animated.View
                style={[
                    styles.content,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
            >
                {/* Header with Location Icon */}
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Ionicons name="location-outline" size={28} color="#5E2D87" />
                    </View>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Map Illustration */}
                    <View style={styles.mapContainer}>
                        <Image
                            source={require("../../assets/images/location-map.png")}
                            style={styles.mapImage}
                            contentFit="contain"
                        />
                    </View>

                    {/* Heading Section */}
                    <View style={styles.headingContainer}>
                        <Text style={styles.title}>Select Your Location</Text>
                        <Text style={styles.subtitle}>
                            Switch on your location to stay in tune with what's happening in your area
                        </Text>
                    </View>

                    {/* Inputs / Dropdowns */}
                    <View style={styles.inputsContainer}>
                        {/* Zone Selector */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Your Zone</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.dropdownText}>{zone}</Text>
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Area Selector */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Your Area</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.dropdownPlaceholder}>
                                    {area || "Types of your area"}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Continue Button */}
                    <View style={styles.buttonContainer}>
                        <PrimaryButton
                            title="Continue"
                            onPress={handleContinue}
                        />
                        <Text style={styles.termsText}>
                            By clicking on "Continue" you are agreeing to our{" "}
                            <Text style={styles.termsLink}>terms of use</Text>
                        </Text>
                    </View>
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
    },
    headerIcon: {
        alignItems: "center",
        padding: 8,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    mapContainer: {
        alignItems: "center",
        marginBottom: 24,
        marginTop: 16,
    },
    mapImage: {
        width: 280,
        height: 280,
    },
    headingContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#111827",
        textAlign: "center",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 16,
    },
    inputsContainer: {
        gap: 24,
        marginBottom: 32,
    },
    inputWrapper: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginLeft: 4,
    },
    dropdown: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    dropdownText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    dropdownPlaceholder: {
        fontSize: 16,
        color: "#9CA3AF",
    },
    buttonContainer: {
        marginTop: 8,
    },
    termsText: {
        fontSize: 11,
        color: "#9CA3AF",
        textAlign: "center",
        marginTop: 16,
        paddingHorizontal: 32,
        lineHeight: 16,
    },
    termsLink: {
        textDecorationLine: "underline",
        fontWeight: "700",
        color: "#111827",
    },
});
