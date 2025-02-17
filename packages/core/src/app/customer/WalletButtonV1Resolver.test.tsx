import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import CheckoutButtonV1Resolver from './WalletButtonV1Resolver';

describe('CheckoutButtonV1Resolver', () => {
    it('renders ApplePay button', () => {
        render(
            <CheckoutButtonV1Resolver
                deinitialize={jest.fn()}
                initialize={jest.fn()}
                methodId="applepay"
                onClick={jest.fn()}
                onError={jest.fn()}
            />,
        );

        const allDivs = screen.getAllByRole('generic');

        expect(allDivs[1]).toHaveAttribute('id', 'applepayCheckoutButton');
    });

    it('renders ApplePay button', () => {
        render(
            <CheckoutButtonV1Resolver
                deinitialize={jest.fn()}
                initialize={jest.fn()}
                methodId="applepay"
                onClick={jest.fn()}
                onError={jest.fn()}
            />,
        );

        const allDivs = screen.getAllByRole('generic');

        expect(allDivs[1]).toHaveAttribute('id', 'applepayCheckoutButton');
    });

    it('renders PaypalCommerceCredit button', () => {
        render(
            <CheckoutButtonV1Resolver
                deinitialize={jest.fn()}
                initialize={jest.fn()}
                methodId="paypalcommercecredit"
                onClick={jest.fn()}
                onError={jest.fn()}
            />,
        );

        const allDivs = screen.getAllByRole('generic');

        expect(allDivs[1]).toHaveAttribute('id', 'paypalcommercecreditCheckoutButton');
    });

    it('renders PaypalCommerce button', () => {
        render(
            <CheckoutButtonV1Resolver
                deinitialize={jest.fn()}
                initialize={jest.fn()}
                methodId="paypalcommerce"
                onClick={jest.fn()}
                onError={jest.fn()}
            />,
        );

        const allDivs = screen.getAllByRole('generic');

        expect(allDivs[1]).toHaveAttribute('id', 'paypalcommerceCheckoutButton');
    });

    it('renders Google Pay button', () => {
        render(
            <CheckoutButtonV1Resolver
                deinitialize={jest.fn()}
                initialize={jest.fn()}
                methodId="googlepay"
                onClick={jest.fn()}
                onError={jest.fn()}
            />,
        );

        const allDivs = screen.getAllByRole('generic');

        expect(allDivs[1]).toHaveAttribute('id', 'googlepayCheckoutButton');
    });
});
