import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';
import { object } from 'yup';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../../config/config.mock';
import {
    withHostedCreditCardFieldset,
    WithInjectedHostedCreditCardFieldsetProps,
} from '../hostedCreditCard';
import { getPaymentMethod } from '../payment-methods.mock';

import HostedWidgetPaymentMethod, {
    HostedWidgetPaymentMethodProps,
} from './HostedWidgetPaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';

const hostedFormOptions = {
    fields: {
        cardCodeVerification: {
            containerId: 'card-code-verification',
            instrumentId: 'instrument-id',
        },
        cardNumberVerification: {
            containerId: 'card-number-verification',
            instrumentId: 'instrument-id',
        },
    },
};

const injectedProps: WithInjectedHostedCreditCardFieldsetProps = {
    getHostedFormOptions: () => Promise.resolve(hostedFormOptions),
    getHostedStoredCardValidationFieldset: () => <div />,
    hostedFieldset: <div />,
    hostedStoredCardValidationSchema: object(),
    hostedValidationSchema: object(),
};

jest.mock('../hostedCreditCard', () => ({
    ...jest.requireActual('../hostedCreditCard'),
    withHostedCreditCardFieldset: jest.fn((Component) => (props: any) => (
        <Component {...props} {...injectedProps} />
    )) as jest.Mocked<typeof withHostedCreditCardFieldset>,
}));

describe('when using Stripe payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;

    beforeEach(() => {
        defaultProps = {
            method: getPaymentMethod(),
            onUnhandledError: jest.fn(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <PaymentMethodComponent {...props} />
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
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

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
            const authFail3ds = Object.create(new Error('Something went wrong.'));

            authFail3ds.name = 'StripeV3Error';
            authFail3ds.type = 'stripev3_error';
            authFail3ds.subtype = 'auth_failure';

            mount(<PaymentMethodTest {...defaultProps} method={method} />)
                .find(HostedWidgetPaymentMethod)
                .props()
                .onUnhandledError(authFail3ds);

            expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(
                new Error(localeContext.language.translate('payment.stripev3_auth_3ds_fail')),
            );
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

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
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

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
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

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
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

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
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

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
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

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
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

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
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

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
