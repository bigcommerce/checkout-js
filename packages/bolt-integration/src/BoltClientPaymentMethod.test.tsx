import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
    type PaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutProvider,
    PaymentFormContext,
    type PaymentFormContextProps,
    PaymentMethodId,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import BoltClientPaymentMethod from './BoltClientPaymentMethod';

describe('BoltClientPaymentMethod', () => {
    let defaultProps: PaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let initializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentInitializeOptions]
    >;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentFormContextProps;
    let PaymentMethodTest: FunctionComponent;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        defaultProps = {
            checkoutService,
            checkoutState,
            language: createLanguageService(),
            method: {
                ...getPaymentMethod(),
                id: PaymentMethodId.Bolt,
                initializationData: {
                    embeddedOneClickEnabled: false,
                },
            },
            onUnhandledError: jest.fn(),
            paymentForm: getPaymentFormServiceMock(),
        };
        localeContext = createLocaleContext(getStoreConfig());

        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentFormContext.Provider value={paymentContext}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <BoltClientPaymentMethod {...defaultProps} {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentFormContext.Provider>
            </CheckoutProvider>
        );
    });

    it('initializes method with required config', () => {
        render(<PaymentMethodTest />);

        expect(initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: defaultProps.method.id,
                [defaultProps.method.id]: {
                    useBigCommerceCheckout: true,
                },
            }),
        );
    });
});
