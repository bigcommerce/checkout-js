/* eslint @typescript-eslint/no-floating-promises: 0 */
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
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import StripeV3PaymentMethod from './StripeV3PaymentMethod';

describe('when using StripeV3 payment', () => {
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
                        <StripeV3PaymentMethod {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    describe('when using alipay component', () => {
        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'alipay',
                gateway: 'stripev3',
                method: 'alipay',
                initializationData: {},
            };
        });

        it('renders as hosted widget method', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component = container.find(HostedWidgetPaymentComponent);

            expect(component.props()).toEqual(
                expect.objectContaining({
                    containerId: `stripe-alipay-component-field`,
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method,
                }),
            );
        });

        it('return stripe v3 3ds auth failure', () => {
            const authFail3ds = Object.create(new Error('payment.stripev3_auth_3ds_fail'));

            authFail3ds.name = 'StripeV3Error';
            authFail3ds.type = 'stripev3_error';
            authFail3ds.subtype = 'auth_failure';

            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const hostedWidgetContainer =
                HostedWidgetPaymentComponent as unknown as React.Component;

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            container.find(hostedWidgetContainer).props().onUnhandledError(authFail3ds);

            expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(authFail3ds);
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component = container.find(HostedWidgetPaymentComponent);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,
                    stripev3: {
                        containerId: 'stripe-alipay-component-field',
                    },
                }),
            );
        });
    });

    describe('when using card component', () => {
        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'card',
                gateway: 'stripev3',
                method: 'card',
                initializationData: {
                    useIndividualCardFields: false,
                },
            };
        });

        it('renders as hosted widget method', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component = container.find(HostedWidgetPaymentComponent);

            expect(component.props()).toEqual(
                expect.objectContaining({
                    containerId: `stripe-card-component-field`,
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    additionalContainerClassName: 'optimizedCheckout-form-input widget--stripev3',
                    method,
                }),
            );
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component = container.find(HostedWidgetPaymentComponent);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,
                    stripev3: {
                        options: {
                            classes: {
                                base: 'form-input optimizedCheckout-form-input',
                            },
                        },
                        containerId: 'stripe-card-component-field',
                    },
                }),
            );
        });

        it('initializes method with required config when useIndividualCardFields option is true', () => {
            method.initializationData.useIndividualCardFields = true;

            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component = container.find(HostedWidgetPaymentComponent);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            expect(checkoutService.initializePayment).toHaveBeenCalledWith({
                gatewayId: method.gateway,
                methodId: method.id,
                stripev3: {
                    containerId: 'stripe-card-component-field',
                    options: {
                        cardNumberElementOptions: {
                            showIcon: true,
                            classes: {
                                base: 'form-input optimizedCheckout-form-input',
                            },
                            placeholder: '',
                            containerId: 'stripe-card-number-component-field',
                        },
                        cardExpiryElementOptions: {
                            classes: {
                                base: 'form-input optimizedCheckout-form-input',
                            },
                            containerId: 'stripe-expiry-component-field',
                        },
                        cardCvcElementOptions: {
                            classes: {
                                base: 'form-input optimizedCheckout-form-input',
                            },
                            placeholder: '',
                            containerId: 'stripe-cvc-component-field',
                        },
                    },
                },
            });
        });
    });

    describe('when using ideal component', () => {
        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'idealBank',
                gateway: 'stripev3',
                method: 'idealBank',
                initializationData: {},
            };
        });

        it('renders as hosted widget method', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component = container.find(HostedWidgetPaymentComponent);

            expect(component.props()).toEqual(
                expect.objectContaining({
                    containerId: `stripe-idealBank-component-field`,
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    additionalContainerClassName: 'optimizedCheckout-form-input widget--stripev3',
                    method,
                }),
            );
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component = container.find(HostedWidgetPaymentComponent);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,
                    stripev3: {
                        containerId: 'stripe-idealBank-component-field',
                        options: {
                            classes: {
                                base: 'form-input optimizedCheckout-form-input',
                            },
                        },
                    },
                }),
            );
        });
    });

    describe('when using iban component', () => {
        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'iban',
                gateway: 'stripev3',
                method: 'iban',
                initializationData: {},
            };
        });

        it('renders as hosted widget method', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component = container.find(HostedWidgetPaymentComponent);

            expect(component.props()).toEqual(
                expect.objectContaining({
                    containerId: `stripe-iban-component-field`,
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    additionalContainerClassName: 'optimizedCheckout-form-input widget--stripev3',
                    method,
                }),
            );
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component = container.find(HostedWidgetPaymentComponent);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,
                    stripev3: {
                        options: {
                            classes: {
                                base: 'form-input optimizedCheckout-form-input',
                            },
                            supportedCountries: ['SEPA'],
                        },
                        containerId: 'stripe-iban-component-field',
                    },
                }),
            );
        });

        it('returns storeUrl null if getConfig is undefined', () => {
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(undefined);

            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(container.prop('storeUrl')).toBeUndefined();
        });
    });
});
