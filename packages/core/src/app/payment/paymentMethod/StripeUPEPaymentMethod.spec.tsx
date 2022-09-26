import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';
import { object } from 'yup';

import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import {
    withHostedCreditCardFieldset,
    WithInjectedHostedCreditCardFieldsetProps,
} from '../hostedCreditCard';
import { getPaymentMethod } from '../payment-methods.mock';

import HostedWidgetPaymentMethod, {
    HostedWidgetPaymentMethodProps,
} from './HostedWidgetPaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';

const hostedFormOptions = {
    fields: {
        cardCodeVerification: {
            containerId: 'card-code-verification',
            instrumentId: 'instrument-id',
        },
        cardNumberVerification: {
            containerId: 'card-number-verification',
            instrumentId: 'instrument-id',
        },
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
jest.mock('../../common/dom', () => ({
    getAppliedStyles: () => {
        return { color: '#cccccc' };
    },
}));

describe('when using Stripe payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;

    beforeEach(() => {
        const dummyElement = document.createElement('div');

        defaultProps = {
            method: getPaymentMethod(),
            onUnhandledError: jest.fn(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(document, 'getElementById').mockReturnValue(dummyElement);

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <PaymentMethodComponent {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    describe('when using alipay component', () => {
        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'alipay',
                gateway: 'stripeupe',
                method: 'alipay',
                initializationData: {},
            };
        });

        it('renders as hosted widget method', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

            expect(component.props()).toEqual(
                expect.objectContaining({
                    containerId: `stripe-alipay-component-field`,
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method,
                }),
            );
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,
                    stripeupe: {
                        containerId: 'stripe-alipay-component-field',
                        style: expect.objectContaining({
                            fieldText: '#cccccc',
                        }),
                        onError: expect.any(Function),
                    },
                }),
            );
        });
    });

    describe('when using card component', () => {
        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'card',
                gateway: 'stripeupe',
                method: 'card',
                initializationData: {},
            };
        });

        it('renders as hosted widget method', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

            expect(component.props()).toEqual(
                expect.objectContaining({
                    containerId: `stripe-card-component-field`,
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method,
                }),
            );
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,
                    stripeupe: {
                        containerId: 'stripe-card-component-field',
                        style: expect.objectContaining({
                            fieldText: '#cccccc',
                        }),
                        onError: expect.any(Function),
                    },
                }),
            );
        });
    });

    describe('when using ideal component', () => {
        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'idealBank',
                gateway: 'stripeupe',
                method: 'idealBank',
                initializationData: {},
            };
        });

        it('renders as hosted widget method', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

            expect(component.props()).toEqual(
                expect.objectContaining({
                    containerId: `stripe-idealBank-component-field`,
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method,
                }),
            );
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,
                    stripeupe: {
                        containerId: 'stripe-idealBank-component-field',
                        style: expect.objectContaining({
                            fieldText: '#cccccc',
                        }),
                        onError: expect.any(Function),
                    },
                }),
            );
        });
    });

    describe('when using iban component', () => {
        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'iban',
                gateway: 'stripeupe',
                method: 'iban',
                initializationData: {},
            };
        });

        it('renders as hosted widget method', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

            expect(component.props()).toEqual(
                expect.objectContaining({
                    containerId: `stripe-iban-component-field`,
                    deinitializePayment: expect.any(Function),
                    initializePayment: expect.any(Function),
                    method,
                }),
            );
        });

        it('initializes method with required config', () => {
            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,
                    stripeupe: {
                        containerId: 'stripe-iban-component-field',
                        style: expect.objectContaining({
                            fieldText: '#cccccc',
                        }),
                        onError: expect.any(Function),
                    },
                }),
            );
        });

        it('returns storeUrl null if getConfig is undefined', () => {
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(undefined);

            const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(container.prop('storeUrl')).toBeUndefined();
        });
    });
});
