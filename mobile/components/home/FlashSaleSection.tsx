import React, { memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { calculateFinalPrice } from '@/lib/utils';
import FlashSaleTimer from '../FlashSaleTimer';
import { Product } from '@/types';

interface FlashSaleSectionProps {
    products: Product[];
    onProductPress: (id: string) => void;
    targetTime?: string;
    title?: string;
    status?: "ACTIVE" | "SCHEDULED" | "NONE";
}

const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({ products, onProductPress, targetTime, title, status = "ACTIVE" }) => {
    // If no products (and not scheduled), return null. 
    // For scheduled, we might want to show the banner even without products populated yet, 
    // but for now let's assume products might be empty if it's coming soon.
    if (status === "NONE") return null;
    if (products.length === 0 && status === "ACTIVE") return null;

    const isScheduled = status === "SCHEDULED";
    const timerColor = isScheduled ? "#3B82F6" : "#EF4444"; // Blue for scheduled, Red for active
    const timerLabel = isScheduled ? "STARTS IN" : "ENDS IN";

    return (
        <View className="px-6 mt-4">
            <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                    <Text className={`text-base font-bold italic mr-2 ${isScheduled ? "text-blue-500" : "text-accent-red"}`}>
                        {title || (isScheduled ? "COMING SOON" : "FLASH SALE")}
                    </Text>
                    <FlashSaleTimer targetDate={targetTime} label={timerLabel} color={timerColor} />
                </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-2 px-2">
                {products.map((item) => {
                    const salePrice = calculateFinalPrice(item.price, item.isFlashSale, item.discountPercent || 0);
                    const discount = item.discountPercent || 0;
                    const stockLeft = item.stock;

                    return (
                        <TouchableOpacity
                            key={`flash-${item._id}`}
                            className="w-32 bg-white rounded-2xl p-3 mr-3 border border-gray-100 shadow-sm"
                            style={{ elevation: 2 }}
                            onPress={() => onProductPress(item._id)}
                        >
                            <View className="bg-gray-50 rounded-xl p-2 mb-2 w-full aspect-square relative items-center justify-center">
                                <Image
                                    source={{ uri: item.images?.[1] || item.images?.[0] || "https://via.placeholder.com/150" }}
                                    style={{ width: '85%', height: '85%' }}
                                    contentFit="contain"
                                />
                                <View
                                    className="absolute top-0 left-0 px-2 py-1 rounded-br-xl rounded-tl-xl"
                                    style={{ backgroundColor: discount >= 50 ? "#EF4444" : "#F59E0B" }}
                                >
                                    <Text className="text-white text-[9px] font-black">-{discount}%</Text>
                                </View>
                            </View>

                            <Text className="text-[10px] font-medium text-gray-400 line-through mb-0.5" style={{ textDecorationLine: 'line-through' }}>
                                Rs. {item.price}
                            </Text>
                            <Text className="text-sm font-black text-primary mb-1">Rs. {salePrice}</Text>

                            <View className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.min(100, (stockLeft / 20) * 100)}%`,
                                        backgroundColor: discount >= 50 ? "#EF4444" : "#F59E0B"
                                    }}
                                />
                            </View>
                            <Text className="text-[8px] text-gray-400 mt-1 font-bold">{stockLeft} LEFT</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default memo(FlashSaleSection);
