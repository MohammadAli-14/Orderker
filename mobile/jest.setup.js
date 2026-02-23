import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
    init: jest.fn(),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    wrap: (c) => c,
    mobileReplayIntegration: jest.fn(),
}));

// Mock Expo Secure Store
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

// Mock Expo Location
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
    geocodeAsync: jest.fn(),
    reverseGeocodeAsync: jest.fn(),
}));

// Mock Expo Constants
jest.mock('expo-constants', () => ({
    expoConfig: {
        extra: {
            eas: {
                projectId: 'test-project-id',
            },
        },
    },
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => { };
    return Reanimated;
});

// Mock Expo Image
jest.mock('expo-image', () => {
    const { View } = require('react-native');
    return {
        Image: (props) => <View {...props} />,
    };
});
