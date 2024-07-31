import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { HostedWidgetPaymentComponent } from '@bigcommerce/checkout/hosted-widget-integration';
import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutProvider,
    PaymentMethodId,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCheckout,
    getCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import StripeUPEPaymentMethod from './StripeUPEPaymentMethod';

describe('when using StripeUPE payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;

    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = { ...getPaymentMethod(), id: 'pay_now', gateway: PaymentMethodId.StripeUPE };

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

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
                    <Formik initialValues={{}} onSubmit={noop}>
                        <StripeUPEPaymentMethod {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders as hosted widget component', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component = container.find(HostedWidgetPaymentComponent);

        expect(component.props()).toEqual(
            expect.objectContaining({
                containerId: `stripe-${method.id}-component-field`,
                deinitializePayment: expect.any(Function),
                initializePayment: expect.any(Function),
                method,
            }),
        );
    });

    it('initializes method with required config when no instruments', () => {
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(undefined);

        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component = container.find(HostedWidgetPaymentComponent);

        expect(component.props()).toEqual(
            expect.objectContaining({
                containerId: `stripe-${method.id}-component-field`,
                deinitializePayment: expect.any(Function),
                initializePayment: expect.any(Function),
                method,
            }),
        );
    });

    it('initializes method with required config when customer is defined', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component = container.find(HostedWidgetPaymentComponent);

        expect(component.props()).toEqual(
            expect.objectContaining({
                containerId: `stripe-${method.id}-component-field`,
                deinitializePayment: expect.any(Function),
                initializePayment: expect.any(Function),
                method,
            }),
        );
    });

    it('initializes method with required config', () => {
        const element = document.createElement('div');

        element.style.color = 'red';
        element.style.boxShadow = 'boxShadow';
        element.style.borderColor = 'blue';

        jest.spyOn(document, 'getElementById').mockReturnValue(element);
        mount(<PaymentMethodTest {...defaultProps} method={method} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: method.id,
                gatewayId: method.gateway,
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
