import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

interface SecondaryButtonProps {
    onPress: () => void;
    title: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    className?: string;
    textClassName?: string;
}

export const SecondaryButton = ({ onPress, title, icon, disabled, className, textClassName }: SecondaryButtonProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            accessibilityLabel={title}
            accessibilityRole="button"
            accessibilityState={{ disabled: !!disabled }}
            className={`flex-row items-center justify-center w-full py-4 bg-white border border-gray-200 rounded-xl active:bg-gray-50 ${disabled ? "opacity-50" : ""} ${className}`}
        >
            {icon && <View className="mr-3">{icon}</View>}
            <Text
                className={`text-gray-800 text-base font-semibold ${textClassName}`}
                style={{ fontFamily: "PlusJakartaSans_600SemiBold" }}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
};
