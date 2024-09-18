import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { EventEmitter } from 'events';
import { Formik } from 'formik';
import { merge, noop } from 'lodash';
import React, { FunctionComponent } from 'react';
import { object, Schema, string } from 'yup';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, FormContextType } from '@bigcommerce/checkout/ui';

import { getCart } from '../../cart/carts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { getConsignment } from '../../shipping/consignment.mock';
import { LoadingOverlay } from '../../ui/loading';
import { CreditCardFieldset, getCreditCardValidationSchema } from '../creditCard';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';
import {
    CardInstrumentFieldset,
    getInstrumentValidationSchema,
    isInstrumentFeatureAvailable,
} from '../storedInstrument';
import { getCardInstrument, getInstruments } from '../storedInstrument/instruments.mock';

import CreditCardPaymentMethod, {
    CreditCardPaymentMethodProps,
    CreditCardPaymentMethodValues,
} from './CreditCardPaymentMethod';

jest.mock('../storedInstrument', () => ({
    ...jest.requireActual('../storedInstrument'),
    isInstrumentFeatureAvailable: jest.fn<
        ReturnType<typeof isInstrumentFeatureAvailable>,
        Parameters<typeof isInstrumentFeatureAvailable>
    >(() => true),
}));

describe('CreditCardPaymentMethod', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: jest.Mocked<CreditCardPaymentMethodProps>;
    let formContext: FormContextType;
    let initialValues: CreditCardPaymentMethodValues;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;
    let subscribeEventEmitter: EventEmitter;
    let CreditCardPaymentMethodTest: FunctionComponent<CreditCardPaymentMethodProps>;

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

        CreditCardPaymentMethodTest = (props) => {
            return (
                <CheckoutProvider checkoutService={checkoutService}>
                    <PaymentContext.Provider value={paymentContext}>
                        <LocaleContext.Provider value={localeContext}>
                            <FormContext.Provider value={formContext}>
                                <Formik initialValues={initialValues} onSubmit={noop}>
                                    <CreditCardPaymentMethod {...props} />
                                </Formik>
                            </FormContext.Provider>
                        </LocaleContext.Provider>
                    </PaymentContext.Provider>
                </CheckoutProvider>
            );
        };
    });

    it('initializes payment method when component mounts', async () => {
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

        mount(<CreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.initializePayment).toHaveBeenCalledWith(
            {
                methodId: defaultProps.method.id,
            },
            getInstruments()[0],
        );
    });

    it('sets validation schema for credit cards when component mounts', () => {
        mount(<CreditCardPaymentMethodTest {...defaultProps} />);

        expect(paymentContext.setValidationSchema).toHaveBeenCalled();

        const schema: Schema<any> = (paymentContext.setValidationSchema as jest.Mock).mock
            .calls[0][1];
        const expectedSchema = getCreditCardValidationSchema({
            isCardCodeRequired: true,
            language: localeContext.language,
        });

        expect(Object.keys(schema.describe().fields)).toEqual(
            Object.keys(expectedSchema.describe().fields),
        );
    });

    it('uses custom validation schema if passed', () => {
        const expectedSchema = object({
            ccCvv: string(),
            ccExpiry: string(),
            ccName: string(),
            ccNumber: string(),
        });

        mount(
            <CreditCardPaymentMethodTest {...defaultProps} cardValidationSchema={expectedSchema} />,
        );

        expect(paymentContext.setValidationSchema).toHaveBeenCalled();

        const schema: Schema<any> = (paymentContext.setValidationSchema as jest.Mock).mock
            .calls[0][1];

        expect(Object.keys(schema.describe().fields)).toEqual(
            Object.keys(expectedSchema.describe().fields),
        );
    });

    it('does not set validation schema if payment is not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

        mount(<CreditCardPaymentMethodTest {...defaultProps} />);

        expect(paymentContext.setValidationSchema).toHaveBeenCalledWith(defaultProps.method, null);
    });

    it('deinitializes payment method when component unmounts', () => {
        const component = mount(<CreditCardPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.deinitializePayment).not.toHaveBeenCalled();

        component.unmount();

        expect(defaultProps.deinitializePayment).toHaveBeenCalled();
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        let component: ReactWrapper;

        component = mount(<CreditCardPaymentMethodTest {...defaultProps} isInitializing />);

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(true);

        component = mount(<CreditCardPaymentMethodTest {...defaultProps} />);

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(false);
    });

    it('renders credit card fieldset', () => {
        const component = mount(<CreditCardPaymentMethodTest {...defaultProps} />);

        expect(component.find(CreditCardFieldset)).toHaveLength(1);
    });

    it('renders custom credit card fieldset if passed', () => {
        const FoobarFieldset = () => <div />;
        const component = mount(
            <CreditCardPaymentMethodTest {...defaultProps} cardFieldset={<FoobarFieldset />} />,
        );

        expect(component.find(FoobarFieldset)).toHaveLength(1);
    });

    describe('if stored instrument feature is available', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

            jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

            jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);
        });

        it('loads stored instruments when component mounts', async () => {
            mount(<CreditCardPaymentMethodTest {...defaultProps} />);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(checkoutService.loadInstruments).toHaveBeenCalled();
        });

        it('sets validation schema for stored instruments when component mounts', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([
                {
                    ...getCardInstrument(),
                    trustedShippingAddress: false,
                },
            ]);

            mount(<CreditCardPaymentMethodTest {...defaultProps} />);

            expect(paymentContext.setValidationSchema).toHaveBeenCalled();

            const schema: Schema<any> = (paymentContext.setValidationSchema as jest.Mock).mock
                .calls[0][1];
            const expectedSchema = getInstrumentValidationSchema({
                instrumentBrand: 'american_express',
                instrumentLast4: '4444',
                isCardCodeRequired: true,
                isCardNumberRequired: true,
                language: localeContext.language,
            });

            expect(Object.keys(schema.describe().fields)).toEqual(
                Object.keys(expectedSchema.describe().fields),
            );
        });

        it('only shows instruments fieldset when there is at least one stored instrument', () => {
            const component = mount(<CreditCardPaymentMethodTest {...defaultProps} />);

            expect(component.find(CardInstrumentFieldset)).toHaveLength(1);
        });

        it('does not show instruments fieldset when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            const component = mount(<CreditCardPaymentMethodTest {...defaultProps} />);

            expect(component.find(CardInstrumentFieldset)).toHaveLength(0);
        });

        it('shows save credit card form when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            const container = mount(<CreditCardPaymentMethodTest {...defaultProps} />);

            expect(container.find('input[name="shouldSaveInstrument"]').exists()).toBe(true);
        });

        it('uses PaymentMethod to retrieve instruments', () => {
            mount(<CreditCardPaymentMethodTest {...defaultProps} />);

            expect(checkoutState.data.getInstruments).toHaveBeenCalledWith(defaultProps.method);
        });

        it('hides credit card fieldset if user is not adding new card', () => {
            const component = mount(<CreditCardPaymentMethodTest {...defaultProps} />);

            expect(component.find(CreditCardFieldset)).toHaveLength(0);

            component.find(CardInstrumentFieldset).prop('onUseNewInstrument')();

            component.update();

            expect(component.find(CardInstrumentFieldset).prop('selectedInstrumentId')).toBeUndefined();

            expect(component.find(CreditCardFieldset)).toHaveLength(1);
        });

        it('switches to "use new card" view if all instruments are deleted', () => {
            const component = mount(<CreditCardPaymentMethodTest {...defaultProps} />);

            expect(component.find(CreditCardFieldset)).toHaveLength(0);

            // Update state
            checkoutState = merge({}, checkoutState, {
                data: {
                    getInstruments: jest.fn(() => []),
                },
            });

            subscribeEventEmitter.emit('change');

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            component.find(CardInstrumentFieldset).prop('onDeleteInstrument')!(
                getInstruments()[0].bigpayToken,
            );

            component.update();

            expect(component.find(CreditCardFieldset)).toHaveLength(1);
        });
    });
});
