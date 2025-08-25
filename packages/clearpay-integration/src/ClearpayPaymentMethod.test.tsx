import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
} from '@bigcommerce/checkout-sdk';
import React from 'react';

import {
    type PaymentFormService,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCustomer,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import ClearpayPaymentMethod from './ClearpayPaymentMethod';

describe('When using Clearpay payment method', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let paymentForm: PaymentFormService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        defaultProps = {
            method: {
                id: 'pay_by_installment',
                method: 'pay_by_installment',
                supportedCards: [],
                config: {},
                type: 'PAYMENT_TYPE_API',
                gateway: 'clearpay',
            },
            checkoutService,
            checkoutState,
            paymentForm,
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('user does not see a description or instrument fields', () => {
        const { container } = render(<ClearpayPaymentMethod {...defaultProps} />);

        expect(container).toBeEmptyDOMElement();
    });
});
