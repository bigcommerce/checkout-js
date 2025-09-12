import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
} from '@bigcommerce/checkout-sdk';
import { screen } from '@testing-library/react';
import React from 'react';

import type {
    PaymentFormService,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import PaypalPaymentsProPaymentMethod from './PayPalPaymentsProPaymentMethod';

const hostedPaymentMethodText = 'Hosted Payment Component rendered successfully';
const hostedCreditCardPaymentMethodText =
    'Hosted Credit Card Payment Component rendered successfully';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@bigcommerce/checkout/hosted-payment-integration', () => ({
    ...jest.requireActual('@bigcommerce/checkout/hosted-payment-integration'),
    HostedPaymentComponent: () => <div>{hostedPaymentMethodText}</div>,
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@bigcommerce/checkout/hosted-credit-card-integration', () => ({
    ...jest.requireActual('@bigcommerce/checkout/hosted-credit-card-integration'),
    HostedCreditCardComponent: () => <div>{hostedCreditCardPaymentMethodText}</div>,
}));

describe('PaypalPaymentsProPaymentMethod', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: Omit<PaymentMethodProps, 'method'>;
    let paymentForm: PaymentFormService;
    let paymentMethod: PaymentMethodProps['method'];

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();
        paymentMethod = {
            ...getPaymentMethod(),
            id: 'paypalpaymentsprous',
            gateway: 'paypal',
        };

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

    it('renders HostedPaymentMethod when PaypalPaymentsPro payment method has PAYMENT_TYPE_HOSTED type', () => {
        const method = {
            ...paymentMethod,
            type: 'PAYMENT_TYPE_HOSTED',
        };

        render(<PaypalPaymentsProPaymentMethod {...defaultProps} method={method} />);

        expect(screen.getByText(hostedPaymentMethodText)).toBeInTheDocument();
    });

    it('renders HostedCreditCardPaymentMethod when PaypalPaymentsPro payment method has PAYMENT_TYPE_HOSTED type', () => {
        const method = {
            ...paymentMethod,
            type: 'PAYMENT_TYPE_API',
        };

        render(<PaypalPaymentsProPaymentMethod {...defaultProps} method={method} />);

        expect(screen.getByText(hostedCreditCardPaymentMethodText)).toBeInTheDocument();
    });
});
