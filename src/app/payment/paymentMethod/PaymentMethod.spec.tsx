import { createCheckoutService, CheckoutSelectors, CheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { getBillingAddress } from '../../billing/billingAddresses.mock';
import { getCart } from '../../cart/carts.mock';
import { CheckoutProvider } from '../../checkout';
import { getStoreConfig as getDefaultStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import BarclaycardPaymentMethod from './BarclaycardPaymentMethod';
import CheckoutcomCustomPaymentMethod, { CheckoutcomCustomPaymentMethodProps } from './CheckoutcomCustomPaymentMethod';
import CreditCardPaymentMethod, { CreditCardPaymentMethodProps } from './CreditCardPaymentMethod';
import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';
import OfflinePaymentMethod, { OfflinePaymentMethodProps } from './OfflinePaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';
import PaymentMethodId from './PaymentMethodId';
import PaymentMethodProviderType from './PaymentMethodProviderType';
import PPSDKPaymentMethod from './PPSDKPaymentMethod';

describe('PaymentMethod', () => {
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;
    const getStoreConfigMock = jest.fn(getDefaultStoreConfig);

    beforeEach(() => {
        defaultProps = {
            method: getPaymentMethod(),
            onUnhandledError: jest.fn(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfigMock());
        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };

        jest.spyOn(checkoutState.data, 'getBillingAddress')
            .mockReturnValue(getBillingAddress());

        jest.spyOn(checkoutState.data, 'getCart')
            .mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfigMock());

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

    describe('when using checkout.com APMs', () => {
        let creditCardMethod: PaymentMethod;
        let alternateMethodA: PaymentMethod;
        let alternateMethodB: PaymentMethod;

        beforeEach(() => {
            creditCardMethod = {
                ...getPaymentMethod(),
                id: 'credit_card',
                gateway: PaymentMethodId.Checkoutcom,
            };

            alternateMethodA = {
                ...getPaymentMethod(),
                id: 'oxxo',
                gateway: PaymentMethodId.Checkoutcom,
            };

            alternateMethodB = {
                ...getPaymentMethod(),
                id: 'paypal',
                gateway: PaymentMethodId.Checkoutcom,
            };
        });

        it('renders credit_card as credit card payment method', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ creditCardMethod } />);

            expect(container.find(CreditCardPaymentMethod).props())
                .toEqual(expect.objectContaining({
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method: creditCardMethod,
                }));
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ creditCardMethod } />);
            const component: ReactWrapper<CreditCardPaymentMethodProps> = container.find(CreditCardPaymentMethod);

            component.prop('initializePayment')({
                methodId: defaultProps.method.id,
                gatewayId: defaultProps.method.gateway,
            });

            expect(checkoutService.initializePayment)
                .toHaveBeenCalledWith(expect.objectContaining({
                    methodId: creditCardMethod.id,
                    gatewayId: creditCardMethod.gateway,
                }));
        });

        it('renders oxxo as custom payment method', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ alternateMethodA } />);

            expect(container.find(CheckoutcomCustomPaymentMethod).props())
                .toEqual(expect.objectContaining({
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method: alternateMethodA,
                }));
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ alternateMethodA } />);
            const component: ReactWrapper<CheckoutcomCustomPaymentMethodProps> = container.find(CheckoutcomCustomPaymentMethod);

            component.prop('initializePayment')({
                methodId: alternateMethodA.id,
                gatewayId: alternateMethodA.gateway,
            });

            expect(checkoutService.initializePayment)
                .toHaveBeenCalledWith(expect.objectContaining({
                    methodId: alternateMethodA.id,
                    gatewayId: alternateMethodA.gateway,
                }));
        });

        it('renders paypal as hosted payment method', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ alternateMethodB } />);

            expect(container.find(HostedPaymentMethod).props())
                .toEqual(expect.objectContaining({
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method: alternateMethodB,
                }));
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ alternateMethodB } />);
            const component: ReactWrapper<HostedPaymentMethodProps> = container.find(HostedPaymentMethod);

            component.prop('initializePayment')({
                methodId: alternateMethodB.id,
                gatewayId: alternateMethodB.gateway,
            });

            expect(checkoutService.initializePayment)
                .toHaveBeenCalledWith(expect.objectContaining({
                    methodId: alternateMethodB.id,
                    gatewayId: alternateMethodB.gateway,
                }));
        });
    });

    describe('when using a PPSDK payment method', () => {
        let method: PaymentMethod;

        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                type: 'PAYMENT_TYPE_SDK',
                initializationStrategy: {
                    type: 'someInitializationStrategy',
                },
            };
        });

        it('renders as a PPSDK payment method', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);

            expect(container.find(PPSDKPaymentMethod).props())
                .toEqual(expect.objectContaining({
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method,
                }));
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
            const component = container.find(PPSDKPaymentMethod);

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

    describe('when using barclaycard payment method', () => {
        let method: PaymentMethod;

        beforeEach(() => {
            method = {
                id: 'barclaycard',
                method: 'barclaycard',
                supportedCards: [],
                config: {},
                type: 'card',
                gateway: 'barclaycard',
            };
        });

        it('should render barclay PaymentMethod', () => {
            const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);

            expect(container.find(BarclaycardPaymentMethod)).toBeTruthy();
        });
    });
});
