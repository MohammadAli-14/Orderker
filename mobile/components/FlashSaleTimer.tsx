import React, { useState, useEffect, memo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FlashSaleTimerProps {
    targetDate?: string;
    label?: string;
    color?: string;
}

const FlashSaleTimer: React.FC<FlashSaleTimerProps> = ({ targetDate, label, color = "#EF4444" }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });

    useEffect(() => {
        const calculateTime = () => {
            if (!targetDate) return { hours: '00', minutes: '00', seconds: '00' };

            const now = new Date();
            const end = new Date(targetDate);
            const diff = end.getTime() - now.getTime();

            if (diff <= 0) {
                return { hours: '00', minutes: '00', seconds: '00' };
            }

            const h = Math.floor((diff / (1000 * 60 * 60)));
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            return {
                hours: h.toString().padStart(2, '0'),
                minutes: m.toString().padStart(2, '0'),
                seconds: s.toString().padStart(2, '0')
            };
        };

        // Set initial time
        setTimeLeft(calculateTime());

        const timer = setInterval(() => {
            setTimeLeft(calculateTime());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <View className="px-1.5 py-0.5 rounded flex-row items-center" style={{ backgroundColor: color }}>
            <Ionicons name="time-outline" size={10} color="white" style={{ marginRight: 2 }} />
            {label && <Text className="text-white text-[8px] font-bold mr-1">{label}</Text>}
            <Text className="text-white text-[10px] font-bold">
                {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
            </Text>
        </View>
    );
};

export default memo(FlashSaleTimer);
