import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
} from '@bigcommerce/checkout-sdk';
import React from 'react';

import { CheckoutButtonProps } from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';

import BigcommercePaymentsPaypalButton from './BigcommercePaymentsPaypalButton';

describe('BigcommercePaymentsPaypalButton', () => {
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
            containerId: 'bigcommerce-payments-paypal-button-container',
            language: createLanguageService(),
            methodId: 'bigcommerce_payments_paypal',
            onUnhandledError: jest.fn(),
            onWalletButtonClick: jest.fn(),
        };
    });

    it('renders BigcommercePaymentsPaypalButton with provided props', () => {
        render(<BigcommercePaymentsPaypalButton {...defaultProps} />);

        expect(checkoutService.initializeCustomer).toHaveBeenCalledWith({
            methodId: defaultProps.methodId,
            bigcommerce_payments_paypal: {
                container: 'bigcommerce-payments-paypal-button-container',
                onClick: expect.any(Function),
                onComplete: expect.any(Function),
                onError: expect.any(Function),
                onUnhandledError: expect.any(Function),
            },
        });
    });
});
