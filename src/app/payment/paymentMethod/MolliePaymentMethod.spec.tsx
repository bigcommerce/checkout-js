import { createCheckoutService, CardInstrument, CheckoutSelectors, CheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';
import { object } from 'yup';

import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { withHostedCreditCardFieldset, WithInjectedHostedCreditCardFieldsetProps } from '../hostedCreditCard';
import { getPaymentMethod } from '../payment-methods.mock';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';

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

describe('MolliePaymentMethod', () => {
    let method: PaymentMethod;
    let defaultProps: PaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let selectedInstrument: CardInstrument;

    beforeEach(() => {
        defaultProps = {
            method: getPaymentMethod(),
            onUnhandledError: jest.fn(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = {...defaultProps.method, id: 'mollie', gateway: 'mollie', method: 'belfius'};
        selectedInstrument = { bigpayToken: '12345' } as CardInstrument;

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

    it('renders as hosted widget method', () => {
        const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
        const component: ReactWrapper<HostedWidgetPaymentMethodProps> = container.find(HostedWidgetPaymentMethod);

        expect(component.props())
            .toEqual(expect.objectContaining({
                method,
                initializePayment: expect.any(Function),
            }));
    });

    it('initializes method with required config', async () => {
        const container = mount(<PaymentMethodTest { ...defaultProps } method={ method } />);
        const component: ReactWrapper<HostedWidgetPaymentMethodProps> = container.find(HostedWidgetPaymentMethod);
        component.prop('initializePayment')({
            methodId: method.id,
            gatewayId: method.gateway,
        }, selectedInstrument);

        await new Promise(resolve => process.nextTick(resolve));

        expect(checkoutService.initializePayment)
            .toHaveBeenCalledWith(expect.objectContaining({
                gatewayId: method.gateway,
                methodId: method.id,
                mollie: {
                    cardCvcId: 'mollie-card-cvc-component-field',
                    cardExpiryId: 'mollie-card-expiry-component-field',
                    cardHolderId: 'mollie-card-holder-component-field',
                    cardNumberId: 'mollie-card-number-component-field',
                    styles : {
                        base: {
                            color: '#333333',
                            '::placeholder' : {
                                color: '#999999',
                            },
                        },
                        valid: {
                            color: '#090',
                        },
                        invalid: {
                            color: '#D14343',
                        },
                    },
                    containerId: 'mollie-belfius',
                    form: {
                        fields: {
                            cardCode: {
                                containerId: 'cardCode',
                                placeholder: 'Card code',
                             },
                             cardExpiry: {
                                containerId: 'cardExpiry',
                                placeholder: 'Card expiry',
                             },
                             cardName: {
                                containerId: 'cardName',
                                placeholder: 'Card name',
                             },
                             cardNumber: {
                                containerId: 'cardNumber',
                                placeholder: 'Card number',
                             },
                        },
                    },
                },
            }));
    });
});
