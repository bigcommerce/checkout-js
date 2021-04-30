import { createCheckoutService, CheckoutSelectors, CheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { EventEmitter } from 'events';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { getBillingAddress } from '../../billing/billingAddresses.mock';
import { getCart } from '../../cart/carts.mock';
import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { getConsignment } from '../../shipping/consignment.mock';
import { FormContext, FormContextType } from '../../ui/form';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import checkoutcomCustomFormFields, { ccDocumentField } from './CheckoutcomCustomFormFields';
import CreditCardPaymentMethod, { CreditCardPaymentMethodProps, CreditCardPaymentMethodValues } from './CreditCardPaymentMethod';

const getAPMProps = {
    ideal: () => ({
        checkoutCustomMethod: 'ideal',
        method: {
            id: 'ideal',
            gateway: 'checkoutcom',
            logoUrl: '',
            method: 'ideal',
            supportedCards: [],
            providesShippingAddress: false,
            config: { cardCode: null, displayName: 'iDEAL' },
            type: 'PAYMENT_TYPE_API',
            nonce: null,
            initializationData: { gateway: 'checkoutcom', idealIssuers: [{ bic: 'INGBNL2A', name: 'Issuer Simulation V3 - ING' }, { bic: 'RABONL2U', name: 'Issuer Simulation V3 - RABO' }] },
            clientToken: null,
            returnUrl: 'https://test-store.store.bcdev/checkout.php?action=set_external_checkout&provider=checkoutcom',
        },
    }),
    sepa: () => ({
        checkoutCustomMethod: 'sepa',
        method: {
            id: 'sepa',
            gateway: 'checkoutcom',
            logoUrl: '',
            method: 'sepa',
            supportedCards: [],
            providesShippingAddress: false,
            config: { cardCode: null, displayName: 'SEPA' },
            type: 'PAYMENT_TYPE_API',
            nonce: null,
            initializationData: { gateway: 'checkoutcom', sepaCreditor: {
                sepaCreditorAddress: 'sepaCreditorAddress',
                sepaCreditorCity: 'sepaCreditorCity',
                sepaCreditorCompanyName: 'sepaCreditorCompanyName',
                sepaCreditorCountry: 'sepaCreditorCountry',
                sepaCreditorIdentifier: 'sepaCreditorIdentifier',
                sepaCreditorPostalCode: 'sepaCreditorPostalCode',
            }},
            clientToken: null,
            returnUrl: 'https://test-store.store.bcdev/checkout.php?action=set_external_checkout&provider=checkoutcom',
        },
    }),
    oxxo: () => ({
        checkoutCustomMethod: 'oxxo',
        method: {
            id: 'oxxo',
            gateway: 'checkoutcom',
            logoUrl: '',
            method: 'oxxo',
            supportedCards: [],
            providesShippingAddress: false,
            config: { cardCode: null, displayName: 'Oxxo' },
            type: 'PAYMENT_TYPE_API',
            nonce: null,
            initializationData: { gateway: 'checkoutcom' },
            clientToken: null,
            returnUrl: 'https://test-store.store.bcdev/checkout.php?action=set_external_checkout&provider=checkoutcom',
        },
    }),
};

describe('CheckoutCustomFormFields', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: jest.Mocked<Omit<CreditCardPaymentMethodProps, 'cardFieldset' | 'cardValidationSchema' | 'method'>>;
    let formContext: FormContextType;
    let initialValues: CreditCardPaymentMethodValues;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;
    let subscribeEventEmitter: EventEmitter;
    let CheckoutcomAPMsTest: FunctionComponent<Omit<CreditCardPaymentMethodProps, 'cardValidationSchema' | 'deinitializePayment' | 'initializePayment'>>;

    beforeEach(() => {
        defaultProps = {
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

        jest.spyOn(checkoutService, 'getState')
            .mockReturnValue(checkoutState);

        jest.spyOn(checkoutService, 'subscribe')
            .mockImplementation(subscriber => {
                subscribeEventEmitter.on('change', () => subscriber(checkoutState));
                subscribeEventEmitter.emit('change');

                return noop;
            });

        jest.spyOn(checkoutService, 'loadInstruments')
            .mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCart')
            .mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getConsignments')
            .mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue(getCustomer());

        jest.spyOn(checkoutState.data, 'getInstruments')
            .mockReturnValue([]);

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired')
            .mockReturnValue(true);

        CheckoutcomAPMsTest = props => {
            return (
                <CheckoutProvider checkoutService={ checkoutService }>
                    <PaymentContext.Provider value={ paymentContext }>
                        <LocaleContext.Provider value={ localeContext }>
                            <FormContext.Provider value={ formContext }>
                                <Formik
                                    initialValues={ initialValues }
                                    onSubmit={ noop }
                                >
                                    <CreditCardPaymentMethod { ...defaultProps } { ...props } />
                                </Formik>
                            </FormContext.Provider>
                        </LocaleContext.Provider>
                    </PaymentContext.Provider>
                </CheckoutProvider>
            );
        };
    });

    describe('Sepa form fieldset', () => {
        const SepaFormFieldset = checkoutcomCustomFormFields.sepa;

        it('should render the sepa fieldset', () => {
            const sepaProps = getAPMProps.sepa();
            const compoonent = mount(<CheckoutcomAPMsTest { ...sepaProps } cardFieldset={ <SepaFormFieldset debtor={ getBillingAddress() } method={ sepaProps.method } /> } />);

            expect(compoonent.find('input[name="iban"]')).toHaveLength(1);
            expect(compoonent.find('input[name="bic"]')).toHaveLength(1);
            expect(compoonent.find('input[name="sepaMandate"]')).toHaveLength(1);
        });
    });

    describe('iDeal form fieldset', () => {
        const IdealFormFieldset = checkoutcomCustomFormFields.ideal;

        it('should render the ideal fieldset', () => {
            const idealProps = getAPMProps.ideal();
            const compoonent = mount(<CheckoutcomAPMsTest { ...idealProps } cardFieldset={ <IdealFormFieldset method={ idealProps.method } /> } />);

            expect(compoonent.find('input[type="hidden"]')).toHaveLength(1);
        });
    });

    describe('ccDocument form fieldset', () => {
        const CcDocumentFormFieldset = ccDocumentField;

        it('should render the ideal fieldset', () => {
            const oxxoProps = getAPMProps.oxxo();
            const compoonent = mount(<CheckoutcomAPMsTest { ...oxxoProps } cardFieldset={ <CcDocumentFormFieldset method={ oxxoProps.method } /> } />);

            expect(compoonent.find('input[name="ccDocument"]')).toHaveLength(1);
        });
    });
});
