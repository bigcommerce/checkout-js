import { CheckoutService, createCheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import React, { FunctionComponent, ReactNode } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider , PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import { FormProvider } from '@bigcommerce/checkout/ui';

import { getStoreConfig } from '../../config/config.mock';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import { default as PaymentMethodComponent } from './PaymentMethodV2';

describe('PaymentMethod', () => {
    let checkoutService: CheckoutService;
    let paymentContext: PaymentContextProps;
    let ContextProvider: FunctionComponent<{ children: ReactNode }>;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };

        ContextProvider = ({ children }) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider checkoutService={checkoutService}>
                    <PaymentContext.Provider value={paymentContext}>
                        <FormProvider>
                            <Formik initialValues={{}} onSubmit={jest.fn()}>
                                {children}
                            </Formik>
                        </FormProvider>
                    </PaymentContext.Provider>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('renders component by payment method', () => {
        const Foo: FunctionComponent<PaymentMethodProps> = ({ method }) => <div>{method.id}</div>;
        const Bar: FunctionComponent<PaymentMethodProps> = ({ method }) => <div>{method.id}</div>;

        const resolver = (method: PaymentMethod) => {
            return method.id === 'foo' ? Foo : Bar;
        };

        const componentA = mount(
            <ContextProvider>
                <PaymentMethodComponent
                    method={{
                        ...getPaymentMethod(),
                        id: 'foo',
                    }}
                    onUnhandledError={jest.fn()}
                    resolveComponent={resolver}
                />
            </ContextProvider>,
        );
        const componentB = mount(
            <ContextProvider>
                <PaymentMethodComponent
                    method={{
                        ...getPaymentMethod(),
                        id: 'bar',
                    }}
                    onUnhandledError={jest.fn()}
                    resolveComponent={resolver}
                />
            </ContextProvider>,
        );

        expect(componentA.find(Foo)).toBeDefined();
        expect(componentB.find(Bar)).toBeDefined();
    });

    it('returns payment method v1 if cannot resolve', () => {
        const Foo: FunctionComponent<PaymentMethodProps> = ({ method }) => <div>{method.id}</div>;

        const resolver = (method: PaymentMethod) => {
            return method.id === 'foo' ? Foo : undefined;
        };

        const componentFallback = mount(
            <ContextProvider>
                <PaymentMethodComponent
                    method={{
                        ...getPaymentMethod(),
                        id: 'test',
                    }}
                    onUnhandledError={jest.fn()}
                    resolveComponent={resolver}
                />
            </ContextProvider>,
        );

        expect(componentFallback.find(Foo)).toBeDefined();
    });

    it('returns payment method v1 if gateway is mollie', () => {
        const Foo: FunctionComponent<PaymentMethodProps> = ({ method }) => <div>{method.id}</div>;

        const resolver = (method: PaymentMethod) => {
            return method.id === 'applepay' ? Foo : undefined;
        };

        const componentFallback = mount(
            <ContextProvider>
                <PaymentMethodComponent
                    method={{
                        ...getPaymentMethod(),
                        gateway: 'mollie',
                        id: 'applepay',
                    }}
                    onUnhandledError={jest.fn()}
                    resolveComponent={resolver}
                />
            </ContextProvider>,
        );

        expect(componentFallback.find(Foo)).toBeDefined();
    });

    it('returns Square on v2 if PROJECT-4113 experiment is on', () => {
        const storeConfigMock = getStoreConfig();

        storeConfigMock.checkoutSettings.features['PROJECT-4113.squarev2_web_payments_sdk'] = true;
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(storeConfigMock);

        jest
          .spyOn(checkoutService, 'initializePayment')
          .mockResolvedValue(checkoutService.getState());

        const SquareOnV2: FunctionComponent<PaymentMethodProps> = ({ method }) => <div>{method.id}</div>;

        const resolver = (method: PaymentMethod) => {
            return method.id === 'squarev2' ? SquareOnV2 : undefined;
        };

        const componentFallback = mount(
            <ContextProvider>
                <PaymentMethodComponent
                    method={{
                        ...getPaymentMethod(),
                        id: 'squarev2',
                    }}
                    onUnhandledError={jest.fn()}
                    resolveComponent={resolver}
                />
            </ContextProvider>,
        );

        expect(componentFallback.find(SquareOnV2)).toHaveLength(1);
    });
});
