import { PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import { createCheckoutService, CheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import React, { FunctionComponent, ReactNode } from 'react';

import { CheckoutProvider } from '../../checkout';
import { LocaleProvider } from '../../locale';
import { FormProvider } from '../../ui/form';
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
            <CheckoutProvider checkoutService={ checkoutService }>
                <LocaleProvider checkoutService={ checkoutService }>
                    <PaymentContext.Provider value={ paymentContext }>
                        <FormProvider>
                            <Formik
                                initialValues={ {} }
                                onSubmit={ jest.fn() }
                            >
                                { children }
                            </Formik>
                        </FormProvider>
                    </PaymentContext.Provider>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('renders component by payment method', () => {
        const Foo: FunctionComponent<PaymentMethodProps> = ({ method }) => <div>{ method.id }</div>;
        const Bar: FunctionComponent<PaymentMethodProps> = ({ method }) => <div>{ method.id }</div>;

        const resolver = (method: PaymentMethod) => {
            return method.id === 'foo' ? Foo : Bar;
        };

        const componentA = mount(
            <ContextProvider>
                <PaymentMethodComponent
                    method={ {
                        ...getPaymentMethod(),
                        id: 'foo',
                    } }
                    onUnhandledError={ jest.fn() }
                    resolveComponent={ resolver }
                />
            </ContextProvider>
        );
        const componentB = mount(
            <ContextProvider>
                <PaymentMethodComponent
                    method={ {
                        ...getPaymentMethod(),
                        id: 'bar',
                    } }
                    onUnhandledError={ jest.fn() }
                    resolveComponent={ resolver }
                />
            </ContextProvider>
        );

        expect(componentA.find(Foo))
            .toBeDefined();
        expect(componentB.find(Bar))
            .toBeDefined();
    });

    it('returns payment method v1 if cannot resolve', () => {
        const Foo: FunctionComponent<PaymentMethodProps> = ({ method }) => <div>{ method.id }</div>;

        const resolver = (method: PaymentMethod) => {
            return method.id === 'foo' ? Foo : undefined;
        };

        const componentFallback = mount(
            <ContextProvider>
                <PaymentMethodComponent
                    method={ {
                        ...getPaymentMethod(),
                        id: 'test',
                    } }
                    onUnhandledError={ jest.fn() }
                    resolveComponent={ resolver }
                />
            </ContextProvider>
        );

        expect(componentFallback.find(Foo))
            .toBeDefined();
    });
});
