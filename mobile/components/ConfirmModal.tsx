import React from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Pressable,
    Platform,
    ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

interface ConfirmModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    loading?: boolean;
}

export function ConfirmModal({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isDestructive = false,
    loading = false,
}: ConfirmModalProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={loading ? undefined : onClose}
        >
            <View style={styles.overlay}>
                <Pressable
                    style={styles.backdrop}
                    onPress={loading ? undefined : onClose}
                >
                    {Platform.OS === "ios" ? (
                        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                    ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.6)" }]} />
                    )}
                </Pressable>

                <View style={styles.modalCard}>
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, isDestructive ? styles.destructiveCircle : styles.infoCircle]}>
                            <Ionicons
                                name={isDestructive ? "trash-outline" : "alert-circle-outline"}
                                size={28}
                                color="#5E2D87"
                            />
                        </View>
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.secondaryButton}
                            activeOpacity={0.7}
                            disabled={loading}
                        >
                            <Text style={[styles.secondaryButtonText, loading && { opacity: 0.5 }]}>{cancelLabel}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onConfirm}
                            style={[
                                styles.primaryButton,
                                isDestructive ? styles.destructiveButton : styles.infoButton,
                                loading && { opacity: 0.8 }
                            ]}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.primaryButtonText}>{confirmLabel}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalCard: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 20,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    destructiveCircle: {
        backgroundColor: "#F3E8FF",
    },
    infoCircle: {
        backgroundColor: "#F3E8FF",
    },
    title: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 12,
        textAlign: "center",
        fontFamily: "PlusJakartaSans_800ExtraBold",
    },
    message: {
        fontSize: 15,
        color: "#4B5563",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 28,
        paddingHorizontal: 12,
        fontFamily: "PlusJakartaSans_400Regular",
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    primaryButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    destructiveButton: {
        backgroundColor: "#5E2D87",
    },
    infoButton: {
        backgroundColor: "#5E2D87",
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
        fontFamily: "PlusJakartaSans_700Bold",
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        color: "#6B7280",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "PlusJakartaSans_600SemiBold",
    },
});
