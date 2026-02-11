import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface PrimaryButtonProps {
    onPress: () => void;
    title: string;
    loading?: boolean;
    disabled?: boolean;
}

export const PrimaryButton = ({ onPress, title, loading, disabled }: PrimaryButtonProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            accessibilityLabel={title}
            accessibilityRole="button"
            accessibilityState={{ disabled: !!(disabled || loading) }}
            style={{
                backgroundColor: disabled ? "#9CA3AF" : "#5E2D87",
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,
                elevation: 5,
            }}
            className="active:opacity-90"
        >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text
                    style={{
                        color: "white",
                        fontSize: 16,
                        fontFamily: "PlusJakartaSans_600SemiBold",
                    }}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};
