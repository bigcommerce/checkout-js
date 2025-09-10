import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
    type PaymentInitializeOptions,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { createStripeUPEPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/stripe';
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
    PaymentMethodId,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCheckout,
    getCustomer,
    getInstruments,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { AccordionContext, type AccordionContextProps } from '@bigcommerce/checkout/ui';

import StripeUPEPaymentMethod from './StripeUPEPaymentMethod';

describe('when using StripeUPE payment', () => {
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
    let onToggleMock: jest.Mock;
    let accordionContextValues: AccordionContextProps;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = { ...getPaymentMethod(), id: 'pay_now', gateway: PaymentMethodId.StripeUPE };
        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);
        onToggleMock = jest.fn();
        accordionContextValues = {
            onToggle: onToggleMock,
            selectedItemId: 'stripeupe-stripe_ocs',
        };

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        jest.mock('@bigcommerce/checkout/dom-utils', () => ({
            getAppliedStyles: () => {
                return { color: '#cccccc' };
            },
        }));

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
                    <AccordionContext.Provider value={accordionContextValues}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <StripeUPEPaymentMethod {...props} />
                        </Formik>
                    </AccordionContext.Provider>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('initializes method with required config when no instruments', () => {
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(undefined);

        render(<PaymentMethodTest {...defaultProps} method={method} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: 'stripeupe',
            methodId: 'pay_now',
            integrations: [createStripeUPEPaymentStrategy],
            stripeupe: {
                containerId: 'stripe-pay_now-component-field',
                onError: expect.any(Function),
                render: expect.any(Function),
                style: {
                    fieldBackground: '',
                    fieldBorder: '',
                    fieldErrorText: '',
                    fieldInnerShadow: '',
                    fieldPlaceholderText: '',
                    fieldText: '',
                    labelText: '',
                },
            },
        });
    });

    it('initializes method with required config when customer is defined', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
            ...getCustomer(),
            isGuest: false,
        });
        jest.spyOn(checkoutState.data, 'getPaymentProviderCustomer').mockReturnValue({
            stripeLinkAuthenticationState: true,
        });

        render(<PaymentMethodTest {...defaultProps} method={method} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: 'stripeupe',
            methodId: 'pay_now',
            integrations: [createStripeUPEPaymentStrategy],
            stripeupe: {
                containerId: 'stripe-pay_now-component-field',
                onError: expect.any(Function),
                render: expect.any(Function),
                style: {
                    fieldBackground: '',
                    fieldBorder: '',
                    fieldErrorText: '',
                    fieldInnerShadow: '',
                    fieldPlaceholderText: '',
                    fieldText: '',
                    labelText: '',
                },
            },
        });
    });

    it('initializes method with required config', () => {
        const element = document.createElement('div');

        element.style.color = 'red';
        element.style.boxShadow = 'boxShadow';
        element.style.borderColor = 'blue';

        jest.spyOn(document, 'getElementById').mockReturnValue(element);
        render(<PaymentMethodTest {...defaultProps} method={method} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: method.id,
                gatewayId: method.gateway,
                integrations: [createStripeUPEPaymentStrategy],
                [`${method.gateway}`]: {
                    containerId: `stripe-${method.id}-component-field`,
                    style: {
                        fieldBackground: '',
                        fieldBorder: 'blue',
                        fieldErrorText: 'red',
                        fieldInnerShadow: 'boxShadow',
                        fieldPlaceholderText: 'red',
                        fieldText: 'red',
                        labelText: 'red',
                    },
                    onError: expect.any(Function),
                    render: expect.any(Function),
                },
            }),
        );
    });
});
