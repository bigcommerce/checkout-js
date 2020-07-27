import { createCheckoutService, CheckoutSelectors, CheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { getPaymentMethod } from '../payment-methods.mock';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';

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

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        PaymentMethodTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <LocaleContext.Provider value={ localeContext }>
                    <Formik
                        initialValues={ {} }
                        onSubmit={ noop }
                    >
                        <PaymentMethodComponent { ...props } />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    describe('when using alipay component', () => {
        beforeEach(() => {
            method = { ...getPaymentMethod(), id: 'alipay', gateway: 'stripev3', method: 'alipay' };
        });

        it('renders as hosted widget method', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> = container.find(HostedWidgetPaymentMethod);

            expect(component.props())
                .toEqual(expect.objectContaining({
                    containerId: `stripe-alipay-component-field`,
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method,
                }));
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> = container.find(HostedWidgetPaymentMethod);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            expect(checkoutService.initializePayment)
                .toHaveBeenCalledWith(expect.objectContaining({
                    methodId: method.id,
                    stripev3: {
                        containerId: 'stripe-alipay-component-field',
                    },
                }));
        });
    });

    describe('when using card component', () => {
        beforeEach(() => {
            method = { ...getPaymentMethod(), id: 'card', gateway: 'stripev3', method: 'card'};
        });

        it('renders as hosted widget method', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> = container.find(HostedWidgetPaymentMethod);

            expect(component.props())
                .toEqual(expect.objectContaining({
                    containerId: `stripe-card-component-field`,
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    additionalContainerClassName: 'optimizedCheckout-form-input widget--stripev3',
                    method,
                }));
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> = container.find(HostedWidgetPaymentMethod);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            expect(checkoutService.initializePayment)
                .toHaveBeenCalledWith(expect.objectContaining({
                    methodId: method.id,
                    stripev3: {
                        containerId: 'stripe-card-component-field',
                        options: {
                            classes: {
                                base: 'form-input optimizedCheckout-form-input',
                            },
                        },
                    },
                }));
        });
    });

    describe('when using ideal component', () => {
        beforeEach(() => {
            method = { ...getPaymentMethod(), id: 'idealBank', gateway: 'stripev3', method: 'idealBank'};
        });

        it('renders as hosted widget method', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> = container.find(HostedWidgetPaymentMethod);

            expect(component.props())
                .toEqual(expect.objectContaining({
                    containerId: `stripe-idealBank-component-field`,
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    additionalContainerClassName: 'optimizedCheckout-form-input widget--stripev3',
                    method,
                }));
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> = container.find(HostedWidgetPaymentMethod);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            expect(checkoutService.initializePayment)
                .toHaveBeenCalledWith(expect.objectContaining({
                        methodId: method.id,
                        stripev3: {
                            containerId: 'stripe-idealBank-component-field',
                            options: {
                                classes: {
                                    base: 'form-input optimizedCheckout-form-input',
                                },
                            },
                        },
                    })
                );
        });
    });

    describe('when using iban component', () => {
        beforeEach(() => {
            method = { ...getPaymentMethod(), id: 'iban', gateway: 'stripev3', method: 'iban'};
        });

        it('renders as hosted widget method', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> = container.find(HostedWidgetPaymentMethod);

            expect(component.props())
                .toEqual(expect.objectContaining({
                    containerId: `stripe-iban-component-field`,
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    additionalContainerClassName: 'optimizedCheckout-form-input widget--stripev3',
                    method,
                }));
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> = container.find(HostedWidgetPaymentMethod);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            expect(checkoutService.initializePayment)
                .toHaveBeenCalledWith(expect.objectContaining({
                    methodId: method.id,
                    stripev3: {
                        containerId: 'stripe-iban-component-field',
                        options: {
                            classes: {
                                base: 'form-input optimizedCheckout-form-input',
                            },
                            supportedCountries: ['SEPA'],
                        },
                    },
                }));
        });
    });
});
