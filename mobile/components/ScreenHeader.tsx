import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface ScreenHeaderProps {
    title: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
}

export const ScreenHeader = ({ title, showBack = true, rightAction }: ScreenHeaderProps) => {
    const router = useRouter();

    return (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingHorizontal: 4 }}>
            {showBack ? (
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "white"
                    }}
                >
                    <Ionicons name="arrow-back" size={20} color="#1F2937" />
                </TouchableOpacity>
            ) : <View style={{ width: 40 }} />}

            <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#1F2937" }}>
                {title}
            </Text>

            <View style={{ width: 40, alignItems: "flex-end" }}>
                {rightAction}
            </View>
        </View>
    );
};
