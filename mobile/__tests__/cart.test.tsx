import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import CartScreen from '../app/(tabs)/cart';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a QueryClient for testing
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

// Mocks
jest.mock('@/hooks/useCart', () => ({
    __esModule: true,
    default: () => ({
        cart: {
            items: [
                {
                    _id: '1',
                    product: {
                        _id: 'p1',
                        name: 'Apple',
                        price: 100,
                        images: ['image_url'],
                        isFlashSale: false,
                        discountPercent: 0,
                    },
                    quantity: 2,
                },
            ],
        },
        cartItemCount: 1,
        cartTotal: 200,
        isLoading: false,
        isError: false,
        updateQuantity: jest.fn(),
        removeFromCart: jest.fn(),
        clearCart: jest.fn(),
    }),
}));

jest.mock('@/hooks/useAddressess', () => ({
    useAddresses: () => ({
        addresses: [
            {
                _id: 'a1',
                fullName: 'John Doe',
                streetAddress: '123 Street',
                city: 'City',
                state: 'State',
                zipCode: '12345',
                phoneNumber: '03001234567',
                isDefault: true,
            },
        ],
    }),
}));

const mockPost = jest.fn();
jest.mock('@/lib/api', () => ({
    useApi: () => ({
        post: mockPost,
    }),
}));

jest.mock('@stripe/stripe-react-native', () => ({
    useStripe: () => ({
        initPaymentSheet: jest.fn(),
        presentPaymentSheet: jest.fn(),
    }),
}));

jest.mock('@/context/ToastContext', () => ({
    useToast: () => ({
        showToast: jest.fn(),
    }),
}));

jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        back: jest.fn(),
    },
}));

// Mock complex sub-components to avoid React conflicts
jest.mock('@/components/SafeScreen', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/PrimaryButton', () => ({
    PrimaryButton: ({ title, onPress }: any) => (
        <Text onPress={onPress}>{title}</Text>
    ),
}));

jest.mock('@/components/OrderSummary', () => ({
    __esModule: true,
    default: () => <Text>OrderSummary</Text>,
}));

jest.mock('@/components/AddressSelectionModal', () => ({
    __esModule: true,
    default: ({ visible, onProceed }: any) => visible ? (
        <View>
            <Text>Select Delivery Address</Text>
            <Text onPress={() => onProceed({ fullName: 'John', city: 'City' })}>Proceed</Text>
        </View>
    ) : null,
}));

jest.mock('@/components/ConfirmModal', () => ({
    ConfirmModal: () => null,
}));

describe('Cart Screen', () => {
    it('renders cart items and total', () => {
        const { getByText } = render(<CartScreen />, { wrapper });

        expect(getByText('Apple')).toBeTruthy();
        // Subtotal: 200, Shipping: 150, Tax: 10 (5% of 200). Total: 360
        expect(getByText('Rs. 360')).toBeTruthy();
    });

    it('opens address modal on checkout', async () => {
        const { getByText } = render(<CartScreen />, { wrapper });

        const checkoutBtn = getByText('Checkout - Rs. 360');
        fireEvent.press(checkoutBtn);

        // AddressSelectionModal should be visible
        await waitFor(() => {
            expect(getByText('Select Delivery Address')).toBeTruthy();
        });
    });
});
