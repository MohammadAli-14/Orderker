import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AuthScreen from '../app/(auth)/login';

// Mock the hooks
const mockHandleSocialAuth = jest.fn();
jest.mock('@/hooks/useSocialAuth', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        loadingStrategy: null,
        handleSocialAuth: mockHandleSocialAuth,
    })),
}));

jest.mock('@clerk/clerk-expo', () => ({
    useUser: () => ({
        user: null,
        isSignedIn: false,
    }),
    useAuth: () => ({
        signOut: jest.fn(),
    }),
    ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock safe-area-context
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Login Screen', () => {
    it('renders login buttons', () => {
        const { getByText } = render(<AuthScreen />);

        expect(getByText('Continue with Google')).toBeTruthy();
        expect(getByText('Continue with Apple')).toBeTruthy();
    });

    it('shows activity indicator when loading', () => {
        const useSocialAuth = require('@/hooks/useSocialAuth').default;
        useSocialAuth.mockImplementation(() => ({
            loadingStrategy: 'oauth_google',
            handleSocialAuth: jest.fn(),
        }));

        const { queryByText } = render(<AuthScreen />);
        // When loadingStrategy is truthy, it returns a screen with ActivityIndicator and NO button text
        expect(queryByText('Continue with Google')).toBeNull();
    });
});
