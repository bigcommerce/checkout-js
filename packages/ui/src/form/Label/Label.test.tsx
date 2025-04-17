import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import Label from './Label';

describe('Label', () => {
    it('renders component with text', () => {
        render(<Label>Hello world</Label>);

        expect(screen.getByText('Hello world')).toBeInTheDocument();
        expect(screen.getByText('Hello world')).toHaveClass('form-label');
    });

    it('renders component with test ID', () => {
        render(<Label testId="test">Hello world</Label>);

        expect(screen.getByTestId('test')).toBeInTheDocument();
        expect(screen.getByTestId('test')).toHaveTextContent('Hello world');
    });
});
