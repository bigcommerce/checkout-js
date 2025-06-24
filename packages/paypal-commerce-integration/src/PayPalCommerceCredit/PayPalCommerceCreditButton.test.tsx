import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
} from '@bigcommerce/checkout-sdk';
import React from 'react';

import { CheckoutButtonProps } from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';

import PayPalCommerceCreditButton from './PayPalCommerceCreditButton';

describe('PayPalCommerceCreditButton', () => {
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
            containerId: 'paypalcommercecredit-button-container',
            language: createLanguageService(),
            methodId: 'paypalcommercecredit',
            onUnhandledError: jest.fn(),
            onWalletButtonClick: jest.fn(),
        };
    });

    it('renders PayPalCommerceCreditButton with provided props', () => {
        render(<PayPalCommerceCreditButton {...defaultProps} />);

        expect(checkoutService.initializeCustomer).toHaveBeenCalledWith({
            methodId: defaultProps.methodId,
            paypalcommercecredit: {
                container: 'paypalcommercecredit-button-container',
                onClick: expect.any(Function),
                onComplete: expect.any(Function),
                onError: expect.any(Function),
                onUnhandledError: expect.any(Function),
            },
        });
    });
});
