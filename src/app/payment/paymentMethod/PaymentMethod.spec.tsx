import { createCheckoutService, CheckoutSelectors, CheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { getCart } from '../../cart/carts.mock';
import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import CreditCardPaymentMethod, { CreditCardPaymentMethodProps } from './CreditCardPaymentMethod';
import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';
import OfflinePaymentMethod, { OfflinePaymentMethodProps } from './OfflinePaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';
import PaymentMethodId from './PaymentMethodId';
import PaymentMethodProviderType from './PaymentMethodProviderType';

describe('PaymentMethod', () => {
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;

    beforeEach(() => {
        defaultProps = {
            method: getPaymentMethod(),
            onUnhandledError: jest.fn(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };

        jest.spyOn(checkoutState.data, 'getCart')
            .mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue(getCustomer());

        jest.spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        PaymentMethodTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <PaymentContext.Provider value={ paymentContext }>
                    <LocaleContext.Provider value={ localeContext }>
                        <Formik
                            initialValues={ {} }
                            onSubmit={ noop }
                        >
                            <PaymentMethodComponent { ...props } />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentContext.Provider>
            </CheckoutProvider>
        );
    });

    it('calls error callback if unable to initialize', async () => {
        jest.spyOn(checkoutService, 'initializePayment')
            .mockRejectedValue(new Error());

        mount(<PaymentMethodTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError)
            .toHaveBeenCalledWith(expect.any(Error));
    });

    it('renders as hosted paypal payment method in Adyen v1', () => {
        let method: PaymentMethod;

        method = {
            ...getPaymentMethod(),
            id: 'paypal',
            gateway: PaymentMethodId.Adyen,
            type: PaymentMethodProviderType.Hosted,
        };

        const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);

        expect(container.find(HostedPaymentMethod).props())
            .toEqual(expect.objectContaining({
                deinitializePayment: expect.any(Function),
                initializePayment: expect.any(Function),
                method,
            }));
    });

    describe('when using hosted / offsite payment', () => {
        let method: PaymentMethod;

        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'visa',
                gateway: PaymentMethodId.Adyen,
                type: PaymentMethodProviderType.Hosted,
            };
        });

        it('renders as hosted payment method', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);

            expect(container.find(HostedPaymentMethod).props())
                .toEqual(expect.objectContaining({
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method,
                }));
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
            const component: ReactWrapper<HostedPaymentMethodProps> = container.find(HostedPaymentMethod);

            component.prop('initializePayment')({
                methodId: defaultProps.method.id,
                gatewayId: defaultProps.method.gateway,
            });

            expect(checkoutService.initializePayment)
                .toHaveBeenCalledWith(expect.objectContaining({
                    methodId: method.id,
                    gatewayId: method.gateway,
                }));
        });
    });

    describe('when using Afterpay payment', () => {
        let method: PaymentMethod;

        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'PAY_BY_INSTALLMENT',
                gateway: PaymentMethodId.Afterpay,
                type: PaymentMethodProviderType.Api,
            };
        });

        it('renders as hosted payment method', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);

            expect(container.find(HostedPaymentMethod).props())
                .toEqual(expect.objectContaining({
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method,
                }));
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
            const component: ReactWrapper<HostedPaymentMethodProps> = container.find(HostedPaymentMethod);

            component.prop('initializePayment')({
                methodId: defaultProps.method.id,
                gatewayId: defaultProps.method.gateway,
            });

            expect(checkoutService.initializePayment)
                .toHaveBeenCalledWith(expect.objectContaining({
                    methodId: method.id,
                    gatewayId: method.gateway,
                }));
        });
    });

    describe('when using PayPal payment', () => {
        let method: PaymentMethod;

        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'paypalexpress',
                method: 'paypal',
            };
        });

        it('renders as hosted payment method', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);

            expect(container.find(HostedPaymentMethod).props())
                .toEqual(expect.objectContaining({
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method,
                }));
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
            const component: ReactWrapper<HostedPaymentMethodProps> = container.find(HostedPaymentMethod);

            component.prop('initializePayment')({
                methodId: defaultProps.method.id,
                gatewayId: defaultProps.method.gateway,
            });

            expect(checkoutService.initializePayment)
                .toHaveBeenCalledWith(expect.objectContaining({
                    methodId: method.id,
                    gatewayId: method.gateway,
                }));
        });
    });

    describe('when using offline payment', () => {
        let method: PaymentMethod;

        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'cheque',
                type: PaymentMethodProviderType.Offline,
            };
        });

        it('renders as offline method', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);

            expect(container.find(OfflinePaymentMethod).props())
                .toEqual(expect.objectContaining({
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method,
                }));
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
            const component: ReactWrapper<OfflinePaymentMethodProps> = container.find(OfflinePaymentMethod);

            component.prop('initializePayment')({
                methodId: defaultProps.method.id,
                gatewayId: defaultProps.method.gateway,
            });

            expect(checkoutService.initializePayment)
                .toHaveBeenCalledWith(expect.objectContaining({
                    methodId: method.id,
                    gatewayId: method.gateway,
                }));
        });
    });

    describe('when using regular credit card payment', () => {
        let method: PaymentMethod;

        beforeEach(() => {
            method = { ...getPaymentMethod() };
        });

        it('renders as credit card payment method', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);

            expect(container.find(CreditCardPaymentMethod).props())
                .toEqual(expect.objectContaining({
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method,
                }));
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
            const component: ReactWrapper<CreditCardPaymentMethodProps> = container.find(CreditCardPaymentMethod);

            component.prop('initializePayment')({
                methodId: defaultProps.method.id,
                gatewayId: defaultProps.method.gateway,
            });

            expect(checkoutService.initializePayment)
                .toHaveBeenCalledWith(expect.objectContaining({
                    methodId: method.id,
                    gatewayId: method.gateway,
                }));
        });
    });
});
