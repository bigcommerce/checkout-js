import React from 'react';

import { CHECKOUT_ROOT_NODE_ID } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import CheckoutApp, { CheckoutAppProps } from './CheckoutApp';
import { getCheckout } from './checkouts.mock';

describe('CheckoutApp', () => {
    let defaultProps: CheckoutAppProps;
    let container: HTMLElement;

    beforeEach(() => {
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
    });

    it('renders checkout component', () => {
        render(<CheckoutApp {...defaultProps} />);

        expect(screen.getByTestId('checkout-page-skeleton')).toBeInTheDocument();
    });

    it('renders checkout component with sentrySampleRate 1', () => {
        defaultProps = {...defaultProps, sentrySampleRate: 1};

        render(<CheckoutApp {...defaultProps} />);

        expect(screen.getByTestId('checkout-page-skeleton')).toBeInTheDocument();
    });
});
