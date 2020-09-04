import { createCheckoutService, CheckoutSelectors, CheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { useEffect, FunctionComponent } from 'react';
import { object } from 'yup';

import { getCart } from '../../cart/carts.mock';
import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { withHostedCreditCardFieldset, WithInjectedHostedCreditCardFieldsetProps } from '../hostedCreditCard';
import { getPaymentMethod } from '../payment-methods.mock';

import CreditCardPaymentMethod from './CreditCardPaymentMethod';
import PaymentMethodId from './PaymentMethodId';
import PaypalCommerceCreditCardPaymentMethod, { PaypalCommerceCreditCardPaymentMethodProps } from './PaypalCommerceCreditCardPaymentMethod';

const hostedFormOptions = {
    fields: {
        cardCode: { containerId: 'cardCode', placeholder: 'Card code' },
        cardName: { containerId: 'cardName', placeholder: 'Card name' },
        cardNumber: { containerId: 'cardNumber', placeholder: 'Card number' },
        cardExpiry: { containerId: 'cardExpiry', placeholder: 'Card expiry' },
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
    withHostedCreditCardFieldset: jest.fn(
        Component => (props: any) => <Component
            { ...props }
            { ...injectedProps }
        />
    ) as jest.Mocked<typeof withHostedCreditCardFieldset>,
}));

jest.mock('./CreditCardPaymentMethod', () =>
    jest.fn(({
                 initializePayment,
                 method,
             }) => {
        useEffect(() => {
            initializePayment({
                methodId: method.id,
                gatewayId: method.gateway,
            });
        });

        return <div />;
    }) as jest.Mocked<typeof CreditCardPaymentMethod>
);

describe('when using PayPal Commerce Credit Card payment', () => {
    let PaypalTest: FunctionComponent<PaypalCommerceCreditCardPaymentMethodProps>;
    let defaultProps: PaypalCommerceCreditCardPaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

    beforeEach(() => {
        defaultProps = {
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
            isInitializing: false,
            method: {
                ...getPaymentMethod(),
                id: PaymentMethodId.PaypalCommerceCreditCards,
            },
            onUnhandledError: jest.fn(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

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

        PaypalTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <PaypalCommerceCreditCardPaymentMethod { ...props } />
                </Formik>
            </CheckoutProvider>
        );
    });

    it('renders as credit card payment method', async () => {
        const container = mount(<PaypalTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));

        expect(container.find(CreditCardPaymentMethod).props())
            .toEqual(expect.objectContaining({
                deinitializePayment: expect.any(Function),
                initializePayment: expect.any(Function),
                method: defaultProps.method,
            }));
    });

    it('initializes method with required config', async () => {
        mount(<PaypalTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));

        expect(defaultProps.initializePayment)
            .toHaveBeenCalledWith(expect.objectContaining({
                methodId: defaultProps.method.id,
                gatewayId: defaultProps.method.gateway,
                paypalcommerce: {
                    form: hostedFormOptions,
                },
            }));
    });

    it('injects hosted form properties to credit card payment method component', async () => {
        const component = mount(<PaypalTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));

        const decoratedComponent = component.find(CreditCardPaymentMethod);

        expect(decoratedComponent.prop('cardFieldset'))
            .toEqual(injectedProps.hostedFieldset);
        expect(decoratedComponent.prop('cardValidationSchema'))
            .toEqual(injectedProps.hostedValidationSchema);
        expect(decoratedComponent.prop('getStoredCardValidationFieldset'))
            .toEqual(injectedProps.getHostedStoredCardValidationFieldset);
        expect(decoratedComponent.prop('storedCardValidationSchema'))
            .toEqual(injectedProps.hostedStoredCardValidationSchema);
    });
});
