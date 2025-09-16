import React from 'react';

import { CHECKOUT_ROOT_NODE_ID } from '@bigcommerce/checkout/payment-integration-api';
import { CheckoutPageNodeObject } from '@bigcommerce/checkout/test-framework';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import CheckoutApp, { type CheckoutAppProps } from './CheckoutApp';
import { getCheckout } from './checkouts.mock';

describe('CheckoutApp', () => {
    let checkout: CheckoutPageNodeObject;
    let defaultProps: CheckoutAppProps;
    let container: HTMLElement;

    beforeEach(() => {
        checkout = new CheckoutPageNodeObject();
        checkout.goto();

        defaultProps = {
            checkoutId: getCheckout().id,
            containerId: CHECKOUT_ROOT_NODE_ID,
        };

        container = document.createElement('div');
        container.id = CHECKOUT_ROOT_NODE_ID;
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        checkout.resetHandlers();
    });

    afterAll(() => {
        checkout.close();
    });

    it('renders checkout component', () => {
        render(<CheckoutApp {...defaultProps} />);

        expect(screen.getByTestId('checkout-page-skeleton')).toBeInTheDocument();
    });

    it('renders checkout component with sentrySampleRate 1', () => {
        defaultProps = { ...defaultProps, sentrySampleRate: 1 };

        render(<CheckoutApp {...defaultProps} />);

        expect(screen.getByTestId('checkout-page-skeleton')).toBeInTheDocument();
    });
});
