import React from 'react';
import { View, Text, TouchableOpacity, Linking, Modal, ActivityIndicator } from 'react-native';
import { useConfig } from '@/hooks/useConfig';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';

interface ConfigGuardianProps {
    children: React.ReactNode;
}

const ConfigGuardian: React.FC<ConfigGuardianProps> = ({ children }) => {
    const { data: config, isLoading, isError } = useConfig();

    if (isError || !config || isLoading) {
        return children; // Graceful degradation or waiting for StartupLogic
    }

    // 1. Maintenance Check
    if (config.maintenance) {
        return (
            <View className="flex-1 bg-white items-center justify-center px-8">
                <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-6">
                    <Ionicons name="construct-outline" size={48} color="#F97316" />
                </View>
                <Text className="text-2xl font-bold text-text-primary text-center mb-2">Under Maintenance</Text>
                <Text className="text-text-secondary text-center mb-8">
                    {config.maintenance_message}
                </Text>
            </View>
        );
    }

    // 2. Force Update Check
    // Simple version check logic
    const currentVersion = Application.nativeApplicationVersion || "1.0.0";
    const isOutdated = currentVersion < config.minimum_version;

    if (config.force_update && isOutdated) {
        return (
            <View className="flex-1 bg-white items-center justify-center px-8">
                <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-6">
                    <Ionicons name="cloud-download-outline" size={48} color="#5E2D87" />
                </View>
                <Text className="text-2xl font-bold text-text-primary text-center mb-2">Update Required</Text>
                <Text className="text-text-secondary text-center mb-8">
                    A new version of Orderker is available. Please update to continue using the app.
                </Text>
                <TouchableOpacity
                    onPress={() => Linking.openURL(config.update_url)}
                    className="bg-primary w-full py-4 rounded-2xl items-center shadow-lg shadow-primary/30"
                >
                    <Text className="text-white font-bold text-lg">Update Now</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return <>{children}</>;
};

export default ConfigGuardian;
