import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchInputProps {
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    onFilterPress?: () => void;
    containerStyle?: any;
    inputStyle?: any;
    hideFilter?: boolean;
    placeholderTextColor?: string;
}

export const SearchInput = ({
    placeholder = "Search for groceries...",
    value,
    onChangeText,
    onFilterPress,
    containerStyle,
    inputStyle,
    hideFilter = false,
    placeholderTextColor = "#9CA3AF"
}: SearchInputProps) => {
    return (
        <View style={[{ flexDirection: "row", alignItems: "center", marginBottom: 16 }, containerStyle]}>
            <View
                style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: hideFilter ? "transparent" : "#F3F4F6",
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    height: containerStyle?.height || 48
                }}
            >
                {!hideFilter && <Ionicons name="search" size={20} color="#6B7280" />}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderTextColor}
                    style={[{
                        flex: 1,
                        marginLeft: hideFilter ? 0 : 8,
                        fontSize: 14,
                        fontFamily: "PlusJakartaSans_500Medium",
                        color: "#111827", // Darker text for visibility
                        includeFontPadding: false,
                        textAlignVertical: "center"
                    }, inputStyle]}
                />
            </View>

            {!hideFilter && onFilterPress && (
                <TouchableOpacity
                    onPress={onFilterPress}
                    style={{
                        marginLeft: 12,
                        backgroundColor: "#5E2D87",
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <Ionicons name="options-outline" size={24} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
};