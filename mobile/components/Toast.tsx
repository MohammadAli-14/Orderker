import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    Easing,
    runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../context/ToastContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const Toast: React.FC = () => {
    const { toast, hideToast } = useToast();
    const insets = useSafeAreaInsets();

    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (toast?.visible) {
            // Trigger haptic feedback
            if (toast.type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            else if (toast.type === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            else Haptics.selectionAsync();

            translateY.value = withSpring(insets.top + 10, {
                damping: 15,
                stiffness: 100,
            });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            translateY.value = withTiming(-100, {
                duration: 300,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1)
            });
            opacity.value = withTiming(0, { duration: 300 });
        }
    }, [toast?.visible, insets.top]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        };
    });

    if (!toast) return null;

    const getIcon = () => {
        switch (toast.type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            default: return 'information-circle';
        }
    };

    const getColors = () => {
        switch (toast.type) {
            case 'success': return { bg: '#1DB954', text: '#FFFFFF', icon: '#FFFFFF' }; // Spotify Green
            case 'error': return { bg: '#FF4B4B', text: '#FFFFFF', icon: '#FFFFFF' };
            default: return { bg: '#121212', text: '#FFFFFF', icon: '#FFFFFF' }; // Dark Premium
        }
    };

    const theme = getColors();

    return (
        <Animated.View
            style={[
                styles.container,
                animatedStyle,
                { backgroundColor: theme.bg }
            ]}
            className="shadow-xl"
        >
            <View className="flex-row items-center p-4">
                <View style={styles.iconContainer}>
                    <Ionicons name={getIcon() as any} size={28} color={theme.icon} />
                </View>
                <View className="flex-1 ml-3">
                    <Text style={styles.title} className="font-bold text-white text-base">
                        {toast.title}
                    </Text>
                    <Text style={styles.message} className="text-white/90 text-sm">
                        {toast.message}
                    </Text>
                </View>
                <TouchableOpacity onPress={hideToast} className="ml-2">
                    <Ionicons name="close" size={20} color="white" opacity={0.6} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        zIndex: 9999,
        borderRadius: 20,
        minHeight: 80,
        elevation: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        letterSpacing: 0.5,
    },
    message: {
        lineHeight: 18,
    },
});

export default Toast;
