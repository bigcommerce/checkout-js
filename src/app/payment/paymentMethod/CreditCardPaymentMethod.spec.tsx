import { createCheckoutService, CheckoutSelectors, CheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';
import { Schema } from 'yup';

import { getCart } from '../../cart/carts.mock';
import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { getConsignment } from '../../shipping/consignment.mock';
import { LoadingOverlay } from '../../ui/loading';
import { getCreditCardValidationSchema, CreditCardFieldset, CreditCardFieldsetProps } from '../creditCard';
import { getPaymentMethod } from '../payment-methods.mock';
import * as storedInstrumentModule from '../storedInstrument';
import { getCardInstrument, getInstruments } from '../storedInstrument/instruments.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import CreditCardPaymentMethod, { CreditCardPaymentMethodProps, CreditCardPaymentMethodValues } from './CreditCardPaymentMethod';

const { getInstrumentValidationSchema, InstrumentFieldset } = storedInstrumentModule;

describe('CreditCardPaymentMethod', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: CreditCardPaymentMethodProps;
    let initialValues: CreditCardPaymentMethodValues;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;
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
        };

        jest.spyOn(checkoutState.data, 'getCart')
            .mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getConsignments')
            .mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue(getCustomer());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired')
            .mockReturnValue(true);

        CreditCardPaymentMethodTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <PaymentContext.Provider value={ paymentContext }>
                    <LocaleContext.Provider value={ localeContext }>
                        <Formik
                            initialValues={ initialValues }
                            onSubmit={ noop }
                        >
                            <CreditCardPaymentMethod { ...props } />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentContext.Provider>
            </CheckoutProvider>
        );
    });

    it('initializes payment method when component mounts', () => {
        mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

        expect(defaultProps.initializePayment)
            .toHaveBeenCalled();
    });

    it('sets validation schema for credit cards when component mounts', () => {
        mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

        expect(paymentContext.setValidationSchema)
            .toHaveBeenCalled();

        const schema: Schema<any> = (paymentContext.setValidationSchema as jest.Mock).mock.calls[0][1];
        const expectedSchema = getCreditCardValidationSchema({
            isCardCodeRequired: true,
            language: localeContext.language,
        });

        expect(Object.keys(schema.describe().fields))
            .toEqual(Object.keys(expectedSchema.describe().fields));
    });

    it('does not set validation schema if payment is not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired')
            .mockReturnValue(false);

        mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

        expect(paymentContext.setValidationSchema)
            .toHaveBeenCalledWith(defaultProps.method, null);
    });

    it('deinitializes payment method when component unmounts', () => {
        const component = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

        expect(defaultProps.deinitializePayment)
            .not.toHaveBeenCalled();

        component.unmount();

        expect(defaultProps.deinitializePayment)
            .toHaveBeenCalled();
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        let component: ReactWrapper;

        component = mount(<CreditCardPaymentMethodTest
            { ...defaultProps }
            isInitializing
        />);

        expect(component.find(LoadingOverlay).prop('isLoading'))
            .toEqual(true);

        component = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

        expect(component.find(LoadingOverlay).prop('isLoading'))
            .toEqual(false);
    });

    it('renders credit card fieldset', () => {
        const component = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

        expect(component.find(CreditCardFieldset))
            .toHaveLength(1);
    });

    describe('if stored instrument feature is available', () => {
        beforeEach(() => {
            jest.spyOn(storedInstrumentModule, 'isInstrumentFeatureAvailable')
                .mockReturnValue(true);

            jest.spyOn(checkoutState.data, 'getInstruments')
                .mockReturnValue(getInstruments());

            jest.spyOn(checkoutService, 'initializePayment')
                .mockResolvedValue(checkoutState);

            jest.spyOn(checkoutService, 'loadInstruments')
                .mockResolvedValue(checkoutState);
        });

        it('loads stored instruments when component mounts', async () => {
            mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            await new Promise(resolve => process.nextTick(resolve));

            expect(checkoutService.loadInstruments)
                .toHaveBeenCalled();
        });

        it('sets validation schema for stored instruments when component mounts', () => {
            jest.spyOn(checkoutState.data, 'getInstruments')
                .mockReturnValue([{
                    ...getCardInstrument(),
                    trustedShippingAddress: false,
                }]);

            mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            expect(paymentContext.setValidationSchema)
                .toHaveBeenCalled();

            const schema: Schema<any> = (paymentContext.setValidationSchema as jest.Mock).mock.calls[0][1];
            const expectedSchema = getInstrumentValidationSchema({
                instrumentBrand: 'american_express',
                instrumentLast4: '4444',
                isCardCodeRequired: true,
                isCardNumberRequired: true,
                language: localeContext.language,
            });

            expect(Object.keys(schema.describe().fields))
                .toEqual(Object.keys(expectedSchema.describe().fields));
        });

        it('only shows instruments fieldset when there is at least one stored instrument', () => {
            const component = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            expect(component.find(InstrumentFieldset))
                .toHaveLength(1);
        });

        it('does not show instruments fieldset when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments')
                .mockReturnValue([]);

            const component = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            expect(component.find(InstrumentFieldset))
                .toHaveLength(0);
        });

        it('shows save credit card form when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments')
                .mockReturnValue([]);

            const container = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);
            const component: ReactWrapper<CreditCardFieldsetProps> = container.find(CreditCardFieldset);

            expect(component)
                .toHaveLength(1);

            expect(component.prop('shouldShowSaveCardField'))
                .toEqual(true);
        });

        it('uses PaymentMethod to retrieve instruments', () => {
            mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            expect(checkoutState.data.getInstruments)
                .toHaveBeenCalledWith(defaultProps.method);
        });

        it('hides credit card fieldset if user is not adding new card', () => {
            const component = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            expect(component.find(CreditCardFieldset))
                .toHaveLength(0);

            component.find(InstrumentFieldset)
                .prop('onUseNewInstrument')();

            component.update();

            expect(component.find(InstrumentFieldset).prop('selectedInstrumentId'))
                .toEqual(undefined);

            expect(component.find(CreditCardFieldset))
                .toHaveLength(1);
        });
    });
});
