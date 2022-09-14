import { mount } from 'enzyme';
import React, { useEffect } from 'react';
import { object } from 'yup';

import {
    withHostedCreditCardFieldset,
    WithInjectedHostedCreditCardFieldsetProps,
} from '../hostedCreditCard';
import { getPaymentMethod } from '../payment-methods.mock';

import CreditCardPaymentMethod from './CreditCardPaymentMethod';
import HostedCreditCardPaymentMethod, {
    HostedCreditCardPaymentMethodProps,
} from './HostedCreditCardPaymentMethod';

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
    withHostedCreditCardFieldset: jest.fn((Component) => (props: any) => (
        <Component {...props} {...injectedProps} />
    )) as jest.Mocked<typeof withHostedCreditCardFieldset>,
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

describe('HostedCreditCardPaymentMethod', () => {
    let defaultProps: HostedCreditCardPaymentMethodProps;

    beforeEach(() => {
        defaultProps = {
            method: getPaymentMethod(),
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
        };
    });

    it('initializes method with hosted form options', async () => {
        mount(<HostedCreditCardPaymentMethod {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.initializePayment).toHaveBeenCalledWith({
            methodId: defaultProps.method.id,
            creditCard: {
                form: hostedFormOptions,
            },
        });
    });

    it('injects hosted form properties to credit card payment method component', async () => {
        const component = mount(<HostedCreditCardPaymentMethod {...defaultProps} />);

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
