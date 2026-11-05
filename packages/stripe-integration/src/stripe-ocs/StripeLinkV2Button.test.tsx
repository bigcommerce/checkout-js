import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
} from '@bigcommerce/checkout-sdk';
import { createStripeLinkV2CustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/stripe';
import React from 'react';

import { type CheckoutButtonProps } from '@bigcommerce/checkout/payment-integration-api';
import { act, render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import StripeLinkV2Button from './StripeLinkV2Button';

describe('StripeLinkV2Button', () => {
    let defaultProps: CheckoutButtonProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutService, 'initializeCustomer').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutService, 'deinitializeCustomer').mockResolvedValue(checkoutState);

        defaultProps = {
            checkoutService,
            checkoutState,
            containerId: 'stripe-link',
            language: createLanguageService(),
            methodId: 'stripeocs',
            onUnhandledError: jest.fn(),
        };
    });

    it('renders StripeLinkV2Button with provided props', () => {
        render(<StripeLinkV2Button {...defaultProps} />);

        expect(checkoutService.initializeCustomer).toHaveBeenCalledWith({
            methodId: defaultProps.methodId,
            integrations: [createStripeLinkV2CustomerStrategy],
            stripeocs: {
                loadingContainerId: 'checkout-app',
                container: 'stripe-link',
                methodId: 'optimized_checkout',
                gatewayId: 'stripeocs',
                onComplete: expect.any(Function),
                onReady: expect.any(Function),
                onUnhandledError: expect.any(Function),
            },
        });
    });

    it('shows skeleton until Stripe Link button is ready', () => {
        render(<StripeLinkV2Button {...defaultProps} />);

        expect(screen.getByTestId('stripe-link-v2-button-skeleton')).toBeInTheDocument();

        const [[options]] = jest.mocked(checkoutService.initializeCustomer).mock.calls;
        const { onReady } = (options as { stripeocs: { onReady: () => void } }).stripeocs;

        act(() => {
            onReady();
        });

        expect(screen.queryByTestId('stripe-link-v2-button-skeleton')).not.toBeInTheDocument();
    });

    it('hides skeleton and reports the error if initialization fails', async () => {
        const error = new Error('init failed');

        jest.spyOn(checkoutService, 'initializeCustomer').mockRejectedValue(error);

        render(<StripeLinkV2Button {...defaultProps} />);

        await waitFor(() => expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(error));
        expect(screen.queryByTestId('stripe-link-v2-button-skeleton')).not.toBeInTheDocument();
    });
});
