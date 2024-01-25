import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent, useEffect } from 'react';
import { object } from 'yup';

import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getCart } from '../../cart/carts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { WithInjectedHostedCreditCardFieldsetProps } from '../hostedCreditCard';
import withHostedPayPalCommerceCreditCardFieldset from '../hostedCreditCard/withHostedPayPalCommerceCreditCardFieldset';
import { getPaymentMethod } from '../payment-methods.mock';

import CreditCardPaymentMethod from './CreditCardPaymentMethod';
import PaymentMethodId from './PaymentMethodId';
import PaypalCommerceCreditCardPaymentMethod, {
    PaypalCommerceCreditCardPaymentMethodProps,
} from './PaypalCommerceCreditCardPaymentMethod';

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

jest.mock('../hostedCreditCard/withHostedPayPalCommerceCreditCardFieldset', () => ({
    __esModule: true,
    default: jest.fn((Component) => (props: any) => (
        <Component {...props} {...injectedProps} />
    )) as jest.Mocked<typeof withHostedPayPalCommerceCreditCardFieldset>,
}));

jest.mock(
    './CreditCardPaymentMethod',
    () =>
        jest.fn(({ initializePayment, method }) => {
            useEffect(() => {
                initializePayment({
                    methodId: method.id,
                    gatewayId: method.gateway,
                });
            });

            return <div />;
        }) as jest.Mocked<typeof CreditCardPaymentMethod>,
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

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        PaypalTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <PaypalCommerceCreditCardPaymentMethod {...props} />
                </Formik>
            </CheckoutProvider>
        );
    });

    it('renders as credit card payment method', async () => {
        const container = mount(<PaypalTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(container.find(CreditCardPaymentMethod).props()).toEqual(
            expect.objectContaining({
                deinitializePayment: expect.any(Function),
                initializePayment: expect.any(Function),
                method: defaultProps.method,
            }),
        );
    });

    it('initializes method with required config', async () => {
        mount(<PaypalTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: defaultProps.method.id,
                gatewayId: defaultProps.method.gateway,
                paypalcommercecreditcards: {
                    form: hostedFormOptions,
                },
            }),
        );
    });

    it('injects hosted form properties to credit card payment method component', async () => {
        const component = mount(<PaypalTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        const decoratedComponent = component.find(CreditCardPaymentMethod);

        expect(decoratedComponent.prop('cardFieldset')).toEqual(injectedProps.hostedFieldset);
        expect(decoratedComponent.prop('cardValidationSchema')).toEqual(
            injectedProps.hostedValidationSchema,
        );
        expect(decoratedComponent.prop('getStoredCardValidationFieldset')).toEqual(
            injectedProps.getHostedStoredCardValidationFieldset,
        );
        expect(decoratedComponent.prop('storedCardValidationSchema')).toEqual(
            injectedProps.hostedStoredCardValidationSchema,
        );
    });
});
