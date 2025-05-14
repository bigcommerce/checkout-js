import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
    PaymentInitializeOptions,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutProvider,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCheckout,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import AmazonPayV2PaymentMethod from './AmazonPayV2PaymentMethod';

describe('when using AmazonPay payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let initializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentInitializeOptions]
    >;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        localeContext = createLocaleContext(getStoreConfig());

        method = { ...getPaymentMethod(), id: 'amazonpay' };

        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        defaultProps = {
            method,
            checkoutService,
            checkoutState,
            paymentForm: getPaymentFormServiceMock(),
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <AmazonPayV2PaymentMethod {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('initializes method with required config', () => {
        render(<PaymentMethodTest {...defaultProps} method={method} />);

        expect(initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                gatewayId: method.gateway,
                methodId: 'amazonpay',
                amazonpay: {
                    editButtonId: 'editButtonId',
                },
            }),
        );
    });

    it('initializes method with required config when no instruments', () => {
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(undefined);

        render(<PaymentMethodTest {...defaultProps} method={method} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: method.id,
                gatewayId: method.gateway,
                [method.id]: {
                    editButtonId: 'editButtonId',
                },
            }),
        );
    });
});
