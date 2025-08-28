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

import HostedPaymentMethod from './HostedPaymentMethod';

describe('When using Hosted payment method', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: Omit<PaymentMethodProps, 'method'>;
    let paymentForm: PaymentFormService;
    let paymentMethod: PaymentMethodProps['method'];

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        defaultProps = {
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

    test('user does not see a description or instrument fields for Afterpay', () => {
        paymentMethod = {
            id: 'pay_by_installment',
            method: 'pay_by_installment',
            supportedCards: [],
            config: {},
            type: 'PAYMENT_TYPE_API',
            gateway: 'afterpay',
            skipRedirectConfirmationAlert: true,
        };

        const { container } = render(
            <HostedPaymentMethod method={paymentMethod} {...defaultProps} />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    test('user does not see a description or instrument fields for Quadpay (Zip US)', () => {
        paymentMethod = {
            id: 'quadpay',
            method: 'credit-card',
            supportedCards: [],
            config: {},
            type: 'PAYMENT_TYPE_API',
            skipRedirectConfirmationAlert: true,
        };

        const { container } = render(
            <HostedPaymentMethod method={paymentMethod} {...defaultProps} />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    test('user does not see a description or instrument fields for Zip', () => {
        paymentMethod = {
            id: 'zip',
            method: 'credit-card',
            supportedCards: [],
            config: {},
            type: 'PAYMENT_TYPE_API',
            skipRedirectConfirmationAlert: true,
        };

        const { container } = render(
            <HostedPaymentMethod method={paymentMethod} {...defaultProps} />,
        );

        expect(container).toBeEmptyDOMElement();
    });
});
