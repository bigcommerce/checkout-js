import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent, useEffect } from 'react';
import { act } from 'react-dom/test-utils';
import { object } from 'yup';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getCart } from '../../cart/carts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { Modal, ModalProps } from '../../ui/modal';
import {
    withHostedCreditCardFieldset,
    WithInjectedHostedCreditCardFieldsetProps,
} from '../hostedCreditCard';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import BraintreeCreditCardPaymentMethod, {
    BraintreeCreditCardPaymentMethodProps,
} from './BraintreeCreditCardPaymentMethod';
import CreditCardPaymentMethod from './CreditCardPaymentMethod';
import PaymentMethodId from './PaymentMethodId';

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

describe('when using Braintree payment', () => {
    let BraintreeCreditCardPaymentMethodTest: FunctionComponent<BraintreeCreditCardPaymentMethodProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: BraintreeCreditCardPaymentMethodProps;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;

    beforeEach(() => {
        defaultProps = {
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
            isInitializing: false,
            method: {
                ...getPaymentMethod(),
                id: PaymentMethodId.Braintree,
            },
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

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        BraintreeCreditCardPaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentContext.Provider value={paymentContext}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <BraintreeCreditCardPaymentMethod {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders as credit card payment method', async () => {
        const container = mount(<BraintreeCreditCardPaymentMethodTest {...defaultProps} />);

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
        mount(<BraintreeCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: defaultProps.method.id,
                gatewayId: defaultProps.method.gateway,
                braintree: {
                    threeDSecure: {
                        addFrame: expect.any(Function),
                        removeFrame: expect.any(Function),
                    },
                    form: hostedFormOptions,
                },
            }),
        );
    });

    it('injects hosted form properties to credit card payment method component', async () => {
        const component = mount(<BraintreeCreditCardPaymentMethodTest {...defaultProps} />);

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

    it('renders 3DS modal if required by selected method', async () => {
        const component = mount(<BraintreeCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        const initializeOptions = (defaultProps.initializePayment as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.braintree.threeDSecure.addFrame(
                undefined,
                document.createElement('iframe'),
                jest.fn(),
            );
        });

        await new Promise((resolve) => process.nextTick(resolve));

        act(() => {
            component.update();
        });

        expect(component.find(Modal).prop('isOpen')).toBe(true);
    });

    it('cancels 3DS modal flow if user chooses to close modal', async () => {
        const cancelThreeDSecureVerification = jest.fn();
        const component = mount(<BraintreeCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        const initializeOptions = (defaultProps.initializePayment as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.braintree.threeDSecure.addFrame(
                undefined,
                document.createElement('iframe'),
                cancelThreeDSecureVerification,
            );
        });

        await new Promise((resolve) => process.nextTick(resolve));

        act(() => {
            component.update();
        });

        const modal: ReactWrapper<ModalProps> = component.find(Modal);

        act(() => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            modal.prop('onRequestClose')!(new MouseEvent('click') as any);
        });

        expect(cancelThreeDSecureVerification).toHaveBeenCalled();
    });

    it('throws an error when adding a frame is unsuccessful', async () => {
        mount(<BraintreeCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        const initializeOptions = (defaultProps.initializePayment as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.braintree.threeDSecure.addFrame(
                new Error(),
                document.createElement('iframe'),
                jest.fn(),
            );
        });

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });

});
