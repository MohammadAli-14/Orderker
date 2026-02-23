import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FlashSaleTimer from './FlashSaleTimer';

interface FlashSaleBannerProps {
    startTime?: string;
    endTime?: string;
    title?: string;
    status: "ACTIVE" | "SCHEDULED";
    onPress?: () => void;
}

const FlashSaleBanner: React.FC<FlashSaleBannerProps> = ({ startTime, endTime, title, status, onPress }) => {
    const router = useRouter();
    const isScheduled = status === "SCHEDULED";
    const targetTime = isScheduled ? startTime : endTime;
    const bgColor = isScheduled ? "bg-blue-600" : "bg-accent-red";
    const label = isScheduled ? "STARTS IN" : "ENDS IN";

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            // Navigate to flash sale section or page if needed
            // For now, maybe just scroll to section (not easily doable from sticky banner without ref)
            // Or navigate to a dedicated flash sale page if we had one.
            // Let's assume it just acts as a notifier for now.
        }
    };

    if (!targetTime) return null;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            className={`absolute bottom-20 left-4 right-4 ${bgColor} rounded-xl p-3 shadow-lg flex-row items-center justify-between z-50`}
            style={{ elevation: 5 }}
        >
            <View className="flex-row items-center flex-1">
                <View className="bg-white/20 p-1.5 rounded-lg mr-3">
                    <Ionicons name={isScheduled ? "calendar" : "flash"} size={20} color="white" />
                </View>
                <View>
                    <Text className="text-white font-bold text-xs">
                        {title || (isScheduled ? "Flash Sale Coming Soon" : "Flash Sale is Live!")}
                    </Text>
                    <Text className="text-white/80 text-[10px]">
                        {isScheduled ? "Get ready for big savings" : "Don't miss out on these deals"}
                    </Text>
                </View>
            </View>

            <View className="items-end">
                <FlashSaleTimer targetDate={targetTime} label={label} color="rgba(0,0,0,0.2)" />
            </View>
        </TouchableOpacity>
    );
};

export default memo(FlashSaleBanner);
