import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';

const SanityComponent = () => (
    <View>
        <Text>Sanity Check</Text>
    </View>
);

describe('Sanity Check', () => {
    it('renders correctly', () => {
        const { getByText } = render(<SanityComponent />);
        expect(getByText('Sanity Check')).toBeTruthy();
    });
});
