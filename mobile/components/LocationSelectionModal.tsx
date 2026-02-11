import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-expo";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PrimaryButton } from "./PrimaryButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocationDetection } from "../hooks/useLocationDetection";
import { ActivityIndicator } from "react-native";

interface LocationSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    currentZone: string | null;
    currentArea: string | null;
    currentCity?: string | null;
    isLive?: boolean;
    onLocationUpdate: (zone: string, area: string, city?: string, isLive?: boolean) => void;
}

const ZONES = [
    "Malir",
    "Karachi East",
    "Karachi West",
    "Karachi South",
    "Karachi Central",
    "Korangi",
];

const AREAS: { [key: string]: string[] } = {
    "Malir": ["Malir Cantt", "Shah Faisal Colony", "Landhi", "Quaidabad"],
    "Karachi East": ["Gulshan-e-Iqbal", "Gulistan-e-Johar", "PECHS", "Scheme 33"],
    "Karachi West": ["Orangi Town", "SITE", "Baldia Town", "Manghopir"],
    "Karachi South": ["Clifton", "Defence", "Saddar", "Garden"],
    "Karachi Central": ["Gulberg", "North Nazimabad", "Liaquatabad", "New Karachi"],
    "Korangi": ["Korangi Industrial", "Landhi Industrial", "Shah Faisal", "Model Colony"],
};

export function LocationSelectionModal({
    visible,
    onClose,
    currentZone,
    currentArea,
    currentCity,
    isLive,
    onLocationUpdate,
}: LocationSelectionModalProps) {
    const { userId } = useAuth();
    const [selectedZone, setSelectedZone] = useState(currentZone || "Malir");
    const [selectedArea, setSelectedArea] = useState(currentArea || "");
    const [selectionMode, setSelectionMode] = useState<"manual" | "auto">(isLive ? "auto" : "manual");
    const [detectedCity, setDetectedCity] = useState<string | null>(currentCity || null);
    const [isServiceable, setIsServiceable] = useState(true);

    const { detectLocation, loading: detecting } = useLocationDetection();

    const handleAutoDetect = async () => {
        const detected = await detectLocation();
        if (detected) {
            setSelectedZone(detected.zone);
            setSelectedArea(detected.area);
            setDetectedCity(detected.city);
            setIsServiceable(detected.isServiceable);
            setSelectionMode("auto");
        }
    };

    const handleManualSelect = (zone: string) => {
        setSelectedZone(zone);
        setSelectedArea("");
        setSelectionMode("manual");
        setIsServiceable(true);
        setDetectedCity(null);
    };

    const handleAreaSelect = (area: string) => {
        setSelectedArea(area);
        setSelectionMode("manual");
    };

    const handleSave = async () => {
        if (!userId) return;

        try {
            // Save to AsyncStorage using User-Specific Keys
            await AsyncStorage.setItem(`user_zone_${userId}`, selectedZone);
            await AsyncStorage.setItem(`user_area_${userId}`, selectedArea);
            await AsyncStorage.setItem(`user_city_${userId}`, detectedCity || "");
            await AsyncStorage.setItem(`location_mode_${userId}`, selectionMode);

            // Update parent component
            onLocationUpdate(selectedZone, selectedArea, detectedCity || undefined, selectionMode === "auto");
            onClose();
        } catch (error) {
            console.error("Error saving location:", error);
        }
    };

    const availableAreas = AREAS[selectedZone] || [];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.dragIndicator} />
                        <View style={styles.headerContent}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="location-outline" size={28} color="#5E2D87" />
                            </View>
                            <Text style={styles.title}>Select Your Location</Text>
                            <Text style={styles.subtitle}>
                                Choose your delivery zone and area for accurate service
                            </Text>
                        </View>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Auto Detection Button */}
                        <TouchableOpacity
                            style={styles.autoDetectButton}
                            onPress={handleAutoDetect}
                            disabled={detecting}
                        >
                            {detecting ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Ionicons name="navigate" size={18} color="#FFFFFF" />
                            )}
                            <Text style={styles.autoDetectText}>
                                {detecting ? "Locating you..." : "Detect My Location"}
                            </Text>
                        </TouchableOpacity>

                        {/* Zone Selection */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View>
                                    <Text style={styles.label}>Your Zone</Text>
                                    {selectionMode === "auto" && (
                                        <Text style={styles.modeSubtext}>Locked to detected location</Text>
                                    )}
                                </View>
                                <View style={styles.headerActions}>
                                    {selectionMode === "auto" && (
                                        <View style={styles.liveBadge}>
                                            <Ionicons name="flash" size={10} color="#FFFFFF" />
                                            <Text style={styles.liveBadgeText}>LIVE</Text>
                                        </View>
                                    )}
                                    {selectionMode === "auto" && (
                                        <TouchableOpacity
                                            style={styles.inlineSwitch}
                                            onPress={() => setSelectionMode("manual")}
                                        >
                                            <Text style={styles.inlineSwitchText}>Unlock</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Detected Summary (For Testing/Verification) */}
                            {selectionMode === "auto" && (
                                <View style={styles.detectedSummary}>
                                    <View style={styles.detectedMain}>
                                        <Ionicons name="location" size={18} color="#10B981" />
                                        <Text style={styles.detectedText}>
                                            {selectedArea ? `${selectedArea}, ` : ""}{detectedCity || selectedZone}
                                        </Text>
                                    </View>
                                    <Text style={styles.detectedSubtext}>Detected via Live GPS</Text>
                                </View>
                            )}

                            {/* Serviceability Warning */}
                            {!isServiceable && selectionMode === "auto" && (
                                <View style={styles.warningBox}>
                                    <Ionicons name="warning" size={16} color="#B45309" />
                                    <Text style={styles.warningText}>
                                        Orderker is currently only available in Karachi. Detected: {detectedCity}
                                    </Text>
                                </View>
                            )}

                            <View
                                style={[
                                    styles.optionsGrid,
                                    selectionMode === "auto" && styles.disabledGrid
                                ]}
                                pointerEvents={selectionMode === "auto" ? "none" : "auto"}
                            >
                                {ZONES.map((zone) => (
                                    <TouchableOpacity
                                        key={zone}
                                        style={[
                                            styles.optionChip,
                                            selectedZone === zone && styles.optionChipActive,
                                        ]}
                                        onPress={() => handleManualSelect(zone)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                selectedZone === zone && styles.optionTextActive,
                                            ]}
                                        >
                                            {zone}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Area Selection */}
                        {selectedZone && (
                            <View style={styles.section}>
                                <Text style={styles.label}>Your Area</Text>
                                <View
                                    style={[
                                        styles.optionsGrid,
                                        selectionMode === "auto" && styles.disabledGrid
                                    ]}
                                    pointerEvents={selectionMode === "auto" ? "none" : "auto"}
                                >
                                    {availableAreas.map((area) => (
                                        <TouchableOpacity
                                            key={area}
                                            style={[
                                                styles.optionChip,
                                                selectedArea === area && styles.optionChipActive,
                                            ]}
                                            onPress={() => handleAreaSelect(area)}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    selectedArea === area && styles.optionTextActive,
                                                ]}
                                            >
                                                {area}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <PrimaryButton
                            title="Save Location"
                            onPress={handleSave}
                            disabled={!selectedZone || !selectedArea}
                        />
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: "85%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        paddingTop: 12,
        paddingHorizontal: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    dragIndicator: {
        width: 40,
        height: 4,
        backgroundColor: "#D1D5DB",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 20,
    },
    headerContent: {
        alignItems: "center",
    },
    iconContainer: {
        marginBottom: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    autoDetectButton: {
        backgroundColor: "#5E2D87",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 24,
        gap: 8,
        shadowColor: "#5E2D87",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    autoDetectText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: "700",
        color: "#374151",
    },
    liveBadge: {
        backgroundColor: "#10B981",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    liveBadgeText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 1,
    },
    warningBox: {
        backgroundColor: "#FFFBEB",
        borderWidth: 1,
        borderColor: "#FDE68A",
        padding: 12,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 12,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: "#92400E",
        fontWeight: "500",
        lineHeight: 18,
    },
    disabledGrid: {
        opacity: 0.6,
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    modeSubtext: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 2,
    },
    inlineSwitch: {
        backgroundColor: "#F3E8FF",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#E9D5FF",
    },
    inlineSwitchText: {
        color: "#5E2D87",
        fontSize: 11,
        fontWeight: "800",
        textTransform: "uppercase",
    },
    optionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    optionChip: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
    },
    optionChipActive: {
        borderColor: "#5E2D87",
        backgroundColor: "#F3E8FF",
    },
    optionText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
    },
    optionTextActive: {
        color: "#5E2D87",
        fontWeight: "700",
    },
    detectedSummary: {
        backgroundColor: "#F0FDF4",
        borderWidth: 1,
        borderColor: "#DCFCE7",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    detectedMain: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    detectedText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#166534",
    },
    detectedSubtext: {
        fontSize: 12,
        color: "#15803D",
        marginLeft: 26,
    },
    footer: {
        padding: 24,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
});
