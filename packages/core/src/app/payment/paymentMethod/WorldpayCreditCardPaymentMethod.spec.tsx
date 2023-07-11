import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { EventEmitter } from 'events';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';
import { act } from 'react-dom/test-utils';
import { object } from 'yup';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, FormContextType } from '@bigcommerce/checkout/ui';

import { getCart } from '../../cart/carts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { getConsignment } from '../../shipping/consignment.mock';
import { LoadingOverlay } from '../../ui/loading';
import { Modal, ModalProps } from '../../ui/modal';
import {
    withHostedCreditCardFieldset,
    WithInjectedHostedCreditCardFieldsetProps,
} from '../hostedCreditCard';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';
import { CardInstrumentFieldset, isInstrumentFeatureAvailable } from '../storedInstrument';
import { getInstruments } from '../storedInstrument/instruments.mock';

import { CreditCardPaymentMethodValues } from './CreditCardPaymentMethod';
import WorldpayCreditCardPaymentMethod, {
    WorldpayCreditCardPaymentMethodProps,
} from './WorldpayCreditCardPaymentMethod';

jest.mock('../storedInstrument', () => ({
    ...jest.requireActual('../storedInstrument'),
    isInstrumentFeatureAvailable: jest.fn<
        ReturnType<typeof isInstrumentFeatureAvailable>,
        Parameters<typeof isInstrumentFeatureAvailable>
    >(() => true),
}));

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

const injectedPropsMock = jest.fn().mockReturnValueOnce({}).mockReturnValue(injectedProps)

jest.mock('../hostedCreditCard', () => ({
    ...jest.requireActual('../hostedCreditCard'),
    withHostedCreditCardFieldset: jest.fn((Component) => (props: any) => (
        <Component {...props} {...injectedPropsMock()} />
    )) as jest.Mocked<typeof withHostedCreditCardFieldset>,
}));

describe('WorldpayCreditCardPaymentMethod', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: jest.Mocked<WorldpayCreditCardPaymentMethodProps>;
    let formContext: FormContextType;
    let initialValues: CreditCardPaymentMethodValues;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;
    let subscribeEventEmitter: EventEmitter;
    let WorldpayCreditCardPaymentMethodTest: FunctionComponent<WorldpayCreditCardPaymentMethodProps>;

    beforeEach(() => {
        defaultProps = {
            method: getPaymentMethod(),
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
        };

        initialValues = {
            ccCustomerCode: '',
            ccCvv: '',
            ccExpiry: '',
            ccName: '',
            ccNumber: '',
            instrumentId: '',
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
        formContext = {
            isSubmitted: false,
            setSubmitted: jest.fn(),
        };
        subscribeEventEmitter = new EventEmitter();

        jest.spyOn(checkoutService, 'getState').mockReturnValue(checkoutState);

        jest.spyOn(checkoutService, 'subscribe').mockImplementation((subscriber) => {
            subscribeEventEmitter.on('change', () => subscriber(checkoutState));
            subscribeEventEmitter.emit('change');

            return noop;
        });

        jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        WorldpayCreditCardPaymentMethodTest = (props) => {
            return (
                <CheckoutProvider checkoutService={checkoutService}>
                    <PaymentContext.Provider value={paymentContext}>
                        <LocaleContext.Provider value={localeContext}>
                            <FormContext.Provider value={formContext}>
                                <Formik initialValues={initialValues} onSubmit={noop}>
                                    <WorldpayCreditCardPaymentMethod {...props} />
                                </Formik>
                            </FormContext.Provider>
                        </LocaleContext.Provider>
                    </PaymentContext.Provider>
                </CheckoutProvider>
            );
        };
    });

    it('initializes payment method when component mounts without hosted form', async () => {
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

        mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.initializePayment).toHaveBeenCalledWith({
            gatewayId: undefined,
            methodId: 'authorizenet',
            creditCard: {
                form: undefined,
            },
            worldpay: {
                onLoad: expect.any(Function),
            },
        });
    });

    it('initializes payment method when component mounts', async () => {
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

        mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.initializePayment).toHaveBeenCalledWith({
            gatewayId: undefined,
            methodId: 'authorizenet',
            creditCard: {
                form: hostedFormOptions,
            },
            worldpay: {
                onLoad: expect.any(Function),
            },
        });
    });

    it('does not set validation schema if payment is not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

        mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} />);

        expect(paymentContext.setValidationSchema).toHaveBeenCalledWith(defaultProps.method, null);
    });

    it('deinitializes payment method when component unmounts', () => {
        const component = mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.deinitializePayment).not.toHaveBeenCalled();

        component.unmount();

        expect(defaultProps.deinitializePayment).toHaveBeenCalled();
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        let component: ReactWrapper;

        component = mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} isInitializing />);

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(true);

        component = mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} />);

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(false);
    });

    it('renders modal that hosts worldpay payment page', async () => {
        const component = mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        const initializeOptions = (defaultProps.initializePayment as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.worldpay.onLoad(document.createElement('iframe'), jest.fn());
        });

        await new Promise((resolve) => process.nextTick(resolve));

        act(() => {
            component.update();
        });

        expect(component.find(Modal).prop('isOpen')).toBe(true);
    });

    it('renders modal', async () => {
        const component = mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        const initializeOptions = (defaultProps.initializePayment as jest.Mock).mock.calls[0][0];

        const iframe = document.createElement('iframe');

        act(() => {
            initializeOptions.worldpay.onLoad(iframe, jest.fn());
        });

        await new Promise((resolve) => process.nextTick(resolve));

        act(() => {
            component.update();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            component.find(Modal).prop('onAfterOpen')!();
        });

        expect(component.find(Modal).prop('isOpen')).toBe(true);

        expect(component.find(Modal).render().find('iframe')).toHaveLength(1);
    });

    it('renders modal but does not append worldpay payment page because is empty', async () => {
        const component = mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        const initializeOptions = (defaultProps.initializePayment as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.worldpay.onLoad(undefined, jest.fn());
        });

        await new Promise((resolve) => process.nextTick(resolve));

        act(() => {
            component.update();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            component.find(Modal).prop('onAfterOpen')!();
        });

        expect(component.find(Modal).prop('isOpen')).toBe(false);

        expect(component.find(Modal).render().find('iframe')).toHaveLength(0);
    });

    it('cancels payment flow if user chooses to close modal', async () => {
        const cancelWorldpayPayment = jest.fn();
        const component = mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        const initializeOptions = (defaultProps.initializePayment as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.worldpay.onLoad(
                document.createElement('iframe'),
                cancelWorldpayPayment,
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            modal.prop('onRequestClose')!(new MouseEvent('click') as any);
        });

        expect(cancelWorldpayPayment).toHaveBeenCalledTimes(1);
    });

    describe('if stored instrument feature is available', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

            jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

            jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);
        });

        it('loads stored instruments when component mounts', async () => {
            mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} />);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(checkoutService.loadInstruments).toHaveBeenCalled();
        });

        it('only shows instruments fieldset when there is at least one stored instrument', () => {
            const component = mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} />);

            expect(component.find(CardInstrumentFieldset)).toHaveLength(1);
        });

        it('does not show instruments fieldset when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            const component = mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} />);

            expect(component.find(CardInstrumentFieldset)).toHaveLength(0);
        });

        it('shows save credit card form when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            const container = mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} />);

            expect(container.find('input[name="shouldSaveInstrument"]').exists()).toBe(true);
        });

        it('uses PaymentMethod to retrieve instruments', () => {
            mount(<WorldpayCreditCardPaymentMethodTest {...defaultProps} />);

            expect(checkoutState.data.getInstruments).toHaveBeenCalledWith(defaultProps.method);
        });
    });
});
