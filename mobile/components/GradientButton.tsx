import { TouchableOpacity, Text, ActivityIndicator, View, TouchableOpacityProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface GradientButtonProps extends TouchableOpacityProps {
    title: string;
    icon?: keyof typeof Ionicons.glyphMap;
    isLoading?: boolean;
    variant?: "primary" | "success" | "danger";
    size?: "sm" | "md" | "lg";
}

const GRADIENTS = {
    primary: ["#7C3AED", "#5D3EBC", "#4C1D95"] as const, // Purple gradient
    success: ["#22C55E", "#16A34A", "#15803D"] as const,
    danger: ["#EF4444", "#DC2626", "#B91C1C"] as const,
};

const SIZES = {
    sm: "py-3",
    md: "py-4",
    lg: "py-5",
};

const GradientButton = ({
    title,
    icon,
    isLoading = false,
    variant = "primary",
    size = "lg",
    disabled,
    ...props
}: GradientButtonProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            disabled={disabled || isLoading}
            accessibilityLabel={title}
            accessibilityRole="button"
            accessibilityState={{ disabled: !!(disabled || isLoading) }}
            {...props}
        >
            <LinearGradient
                colors={GRADIENTS[variant]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className={`rounded-2xl ${SIZES[size]} ${disabled ? "opacity-50" : ""}`}
            >
                <View className="flex-row items-center justify-center">
                    {isLoading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Text className="text-white font-bold text-lg mr-2">{title}</Text>
                            {icon && <Ionicons name={icon} size={20} color="white" />}
                        </>
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default GradientButton;
