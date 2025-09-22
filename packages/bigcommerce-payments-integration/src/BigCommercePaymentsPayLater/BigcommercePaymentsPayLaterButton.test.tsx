import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
} from '@bigcommerce/checkout-sdk';
import { createBigCommercePaymentsPayLaterCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
import React from 'react';

import { type CheckoutButtonProps } from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';

import BigcommercePaymentsPayLaterButton from './BigcommercePaymentsPayLaterButton';

describe('BigcommercePaymentsPayLaterButton', () => {
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
            containerId: 'bigcommerce-payments-paylater-button-container',
            language: createLanguageService(),
            methodId: 'bigcommerce_payments_paylater',
            onUnhandledError: jest.fn(),
            onWalletButtonClick: jest.fn(),
        };
    });

    it('renders BigcommercePaymentsPayLaterButton with provided props', () => {
        render(<BigcommercePaymentsPayLaterButton {...defaultProps} />);

        expect(checkoutService.initializeCustomer).toHaveBeenCalledWith({
            methodId: defaultProps.methodId,
            integrations: [createBigCommercePaymentsPayLaterCustomerStrategy],
            bigcommerce_payments_paylater: {
                container: 'bigcommerce-payments-paylater-button-container',
                onClick: expect.any(Function),
                onComplete: expect.any(Function),
                onError: expect.any(Function),
                onUnhandledError: expect.any(Function),
            },
        });
    });
});
