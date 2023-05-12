import {
    CardInstrument,
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
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
import MollieCustomCardForm from './MollieCustomCardForm';
import MolliePaymentMethod, { MolliePaymentMethodsProps } from './MolliePaymentMethod';

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
    getHostedStoredCardValidationFieldset: jest.fn(() => <div />),
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

describe('MolliePaymentMethod', () => {
    let defaultProps: MolliePaymentMethodsProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<MolliePaymentMethodsProps>;
    let selectedInstrument: CardInstrument;

    beforeEach(() => {
        defaultProps = {
            method: {
                ...getPaymentMethod(),
                id: 'mollie',
                gateway: 'mollie',
            },
            onUnhandledError: jest.fn(),
            initializePayment: jest.fn(),
            deinitializePayment: jest.fn(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());

        selectedInstrument = { bigpayToken: '12345' } as CardInstrument;

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <MolliePaymentMethod {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders as hosted widget method', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} />);
        const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
            container.find(HostedWidgetPaymentMethod);

        expect(component.props()).toEqual(
            expect.objectContaining({
                method: defaultProps.method,
                initializePayment: expect.any(Function),
            }),
        );
    });

    it('renders CustomPaymentForm', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} />);
        const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
            container.find(HostedWidgetPaymentMethod);
        const customComponent = component.prop('renderCustomPaymentForm')?.();

        expect(customComponent).toEqual(
            <MollieCustomCardForm
                isCreditCard={false}
                method={{
                    config: {
                        cardCode: true,
                        displayName: 'Authorizenet',
                        enablePaypal: undefined,
                        hasDefaultStoredInstrument: false,
                        helpText: '',
                        is3dsEnabled: undefined,
                        isVisaCheckoutEnabled: undefined,
                        merchantId: undefined,
                        testMode: false,
                    },
                    initializationData: {
                        payPalCreditProductBrandName: { credit: '' },
                    },
                    gateway: 'mollie',
                    id: 'mollie',
                    logoUrl: '',
                    method: 'credit-card',
                    supportedCards: ['VISA', 'AMEX', 'MC'],
                    type: 'PAYMENT_TYPE_API',
                }}
                options={{
                    cardCvcElementOptions: {
                        containerId: 'mollie-card-cvc-component-field',
                    },
                    cardExpiryElementOptions: {
                        containerId: 'mollie-card-expiry-component-field',
                    },
                    cardHolderElementOptions: {
                        containerId: 'mollie-card-holder-component-field',
                    },
                    cardNumberElementOptions: {
                        containerId: 'mollie-card-number-component-field',
                    },
                }}
            />,
        );
    });

    it('initializes method with required config', async () => {
        const container = mount(<PaymentMethodTest {...defaultProps} />);
        const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
            container.find(HostedWidgetPaymentMethod);

        component.prop('initializePayment')(
            {
                methodId: defaultProps.method.id,
                gatewayId: defaultProps.method.gateway,
            },
            selectedInstrument,
        );

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                gatewayId: defaultProps.method.gateway,
                methodId: defaultProps.method.id,
                mollie: {
                    cardCvcId: 'mollie-card-cvc-component-field',
                    cardExpiryId: 'mollie-card-expiry-component-field',
                    cardHolderId: 'mollie-card-holder-component-field',
                    cardNumberId: 'mollie-card-number-component-field',
                    styles: {
                        base: {
                            color: '#333333',
                            '::placeholder': {
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
                    containerId: 'mollie-credit-card',
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
                    unsupportedMethodMessage:
                        'This payment method cannot be used towards the purchase of digital products. Please contact customer support or try again.',
                    disableButton: expect.any(Function),
                },
            }),
        );
    });

    it('validateInstrument', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} />);
        const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
            container.find(HostedWidgetPaymentMethod);

        component.prop('validateInstrument')?.(false, selectedInstrument);

        expect(injectedProps.getHostedStoredCardValidationFieldset).toHaveBeenCalledWith(
            selectedInstrument,
        );
    });
});
