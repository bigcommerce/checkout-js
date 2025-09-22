import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
} from '@bigcommerce/checkout-sdk';
import { createStripeLinkV2CustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/stripe';
import React from 'react';

import { type CheckoutButtonProps } from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';

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
            onWalletButtonClick: jest.fn(),
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
                onClick: expect.any(Function),
                onComplete: expect.any(Function),
                onUnhandledError: expect.any(Function),
            },
        });
    });
});
