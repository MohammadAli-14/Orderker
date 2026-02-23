import React, { memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

interface CategoryItem {
    id: string;
    name: string;
    image: any;
}

interface HomeCategoriesProps {
    categories: CategoryItem[];
    activeCategory: string;
}

const HomeCategories: React.FC<HomeCategoriesProps> = ({ categories, activeCategory }) => {
    const router = useRouter();

    return (
        <View className="bg-white -mt-6 rounded-t-[32px] pt-6 pb-2">
            <View className="px-6 flex-row justify-between items-center mb-4">
                <Text className="text-base font-bold text-text-primary">Categories</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/search" as any)}>
                    <Text className="text-primary text-xs font-medium">See All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
                className="flex-row"
            >
                {categories.map((item) => {
                    const isSelected = activeCategory === item.id;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            className="mr-5 items-center"
                            onPress={() => router.push(`/(tabs)/search?category=${item.id}` as any)}
                        >
                            <View
                                className="w-16 h-16 rounded-3xl items-center justify-center border overflow-hidden"
                                style={{
                                    backgroundColor: isSelected ? "white" : "#F9FAFB",
                                    borderColor: isSelected ? "#5E2D87" : "#F3F4F6",
                                    borderWidth: isSelected ? 2 : 1,
                                    shadowColor: isSelected ? "#5E2D87" : "#000",
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: isSelected ? 0.2 : 0.05,
                                    shadowRadius: 8,
                                    elevation: isSelected ? 4 : 2,
                                }}
                            >
                                <Image
                                    source={item.image}
                                    style={{ width: 44, height: 44 }}
                                    contentFit="contain"
                                />
                            </View>
                            <Text
                                className="mt-2 text-[10px] font-medium"
                                style={{
                                    color: isSelected ? "#5E2D87" : "#6B7280",
                                    fontWeight: isSelected ? "bold" : "500"
                                }}
                            >
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default memo(HomeCategories);
