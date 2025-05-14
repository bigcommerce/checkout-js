import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
} from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    PaymentFormService,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCustomer,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import AfterpayPaymentMethod from './AfterpayPaymentMethod';

describe('When using Afterpay Payment Method', () => {
    let checkoutService: CheckoutService;
    let defaultProps: PaymentMethodProps;
    let checkoutState: CheckoutSelectors;
    let paymentForm: PaymentFormService;

    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        localeContext = createLocaleContext(getStoreConfig());

        defaultProps = {
            method: {
                id: 'pay_by_installment',
                method: 'pay_by_installment',
                supportedCards: [],
                config: {},
                type: 'PAYMENT_TYPE_API',
                gateway: 'afterpay',
            },
            checkoutService,
            checkoutState,
            paymentForm,
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        PaymentMethodTest = (props) => (
            <LocaleContext.Provider value={localeContext}>
                <AfterpayPaymentMethod {...props} />
            </LocaleContext.Provider>
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Shopper is able to see Afterpay Payment Method', () => {
        render(<PaymentMethodTest {...defaultProps} />);

        expect(screen.getByText(
            localeContext.language.translate('payment.affirm_body_text')
        )).toBeInTheDocument();
    });
});
