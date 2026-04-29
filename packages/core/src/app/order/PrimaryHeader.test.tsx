import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { PrimaryHeader } from './PrimaryHeader';

describe('PrimaryHeader', () => {
    it('renders children', () => {
        render(<PrimaryHeader>Hello world</PrimaryHeader>);

        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('always applies optimizedCheckout-headingPrimary class', () => {
        render(<PrimaryHeader>Hello world</PrimaryHeader>);

        expect(screen.getByText('Hello world')).toHaveClass('optimizedCheckout-headingPrimary');
    });

    it('renders with a test ID', () => {
        render(<PrimaryHeader testId="primary-heading">Hello world</PrimaryHeader>);

        expect(screen.getByTestId('primary-heading')).toHaveTextContent('Hello world');
    });
});
