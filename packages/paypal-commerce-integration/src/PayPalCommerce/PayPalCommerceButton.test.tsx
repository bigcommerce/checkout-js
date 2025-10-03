import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
} from '@bigcommerce/checkout-sdk';
import { createPayPalCommerceCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/paypal-commerce';
import React from 'react';

import { type CheckoutButtonProps } from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';

import PayPalCommerceButton from './PayPalCommerceButton';

describe('PayPalCommerceButton', () => {
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
            containerId: 'paypalcommerce-button-container',
            language: createLanguageService(),
            methodId: 'paypalcommerce',
            onUnhandledError: jest.fn(),
            onWalletButtonClick: jest.fn(),
        };
    });

    it('renders PayPalCommerceButton with provided props', () => {
        render(<PayPalCommerceButton {...defaultProps} />);

        expect(checkoutService.initializeCustomer).toHaveBeenCalledWith({
            methodId: defaultProps.methodId,
            integrations: [createPayPalCommerceCustomerStrategy],
            paypalcommerce: {
                container: 'paypalcommerce-button-container',
                onClick: expect.any(Function),
                onComplete: expect.any(Function),
                onError: expect.any(Function),
                onUnhandledError: expect.any(Function),
            },
        });
    });
});
