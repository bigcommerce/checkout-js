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

import {
    CreditCardPaymentMethodComponent,
    CreditCardPaymentMethodProps,
    CreditCardPaymentMethodValues,
} from '@bigcommerce/checkout/credit-card-integration';
import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutContext,
    PaymentFormContext,
    PaymentFormService,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getConsignment,
    getCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { DropdownTrigger } from '@bigcommerce/checkout/ui';

import checkoutcomCustomFormFields, {
    ccDocumentField,
    HiddenInput,
    OptionButton,
} from './CheckoutcomCustomFormFields';

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
            initializationData: {
                gateway: 'checkoutcom',
                idealIssuers: [
                    { bic: 'INGBNL2A', name: 'Issuer Simulation V3 - ING' },
                    { bic: 'RABONL2U', name: 'Issuer Simulation V3 - RABO' },
                ],
            },
            clientToken: null,
            returnUrl:
                'https://test-store.store.bcdev/checkout.php?action=set_external_checkout&provider=checkoutcom',
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
            initializationData: {
                gateway: 'checkoutcom',
                sepaCreditor: {
                    sepaCreditorAddress: 'sepaCreditorAddress',
                    sepaCreditorCity: 'sepaCreditorCity',
                    sepaCreditorCompanyName: 'sepaCreditorCompanyName',
                    sepaCreditorCountry: 'sepaCreditorCountry',
                    sepaCreditorIdentifier: 'sepaCreditorIdentifier',
                    sepaCreditorPostalCode: 'sepaCreditorPostalCode',
                },
            },
            clientToken: null,
            returnUrl:
                'https://test-store.store.bcdev/checkout.php?action=set_external_checkout&provider=checkoutcom',
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
            returnUrl:
                'https://test-store.store.bcdev/checkout.php?action=set_external_checkout&provider=checkoutcom',
        },
    }),
    fawry: () => ({
        checkoutCustomMethod: 'fawry',
        method: {
            id: 'fawry',
            gateway: 'checkoutcom',
            logoUrl: '',
            method: 'oxxo',
            supportedCards: [],
            providesShippingAddress: false,
            config: { cardCode: null, displayName: 'fawry' },
            type: 'PAYMENT_TYPE_API',
            nonce: null,
            initializationData: { gateway: 'checkoutcom' },
            clientToken: null,
            returnUrl:
                'https://test-store.store.bcdev/checkout.php?action=set_external_checkout&provider=checkoutcom',
        },
    }),
};

describe('CheckoutCustomFormFields', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: jest.Mocked<CreditCardPaymentMethodProps & PaymentMethodProps>;
    let initialValues: CreditCardPaymentMethodValues;
    let localeContext: LocaleContextType;
    let paymentForm: PaymentFormService;
    let subscribeEventEmitter: EventEmitter;
    let CheckoutcomAPMsTest: FunctionComponent<
        Omit<
            CreditCardPaymentMethodProps,
            'cardValidationSchema' | 'deinitializePayment' | 'initializePayment'
        >
    >;

    beforeEach(() => {
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
        paymentForm = getPaymentFormServiceMock();
        subscribeEventEmitter = new EventEmitter();

        defaultProps = {
            checkoutService,
            checkoutState,
            language: localeContext.language,
            onUnhandledError: jest.fn(),
            paymentForm,
            method: getPaymentMethod(),
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
        };
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

        CheckoutcomAPMsTest = (props) => {
            return (
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                        <PaymentFormContext.Provider value={{ paymentForm }}>
                            <Formik initialValues={initialValues} onSubmit={noop}>
                                <CreditCardPaymentMethodComponent {...defaultProps} {...props} />
                            </Formik>
                        </PaymentFormContext.Provider>
                    </CheckoutContext.Provider>
                </LocaleContext.Provider>
            );
        };
    });

    const billingAddress = {
        id: '55c96cda6f04c',
        firstName: 'Test',
        lastName: 'Tester',
        email: 'test@bigcommerce.com',
        company: 'Bigcommerce',
        address1: '12345 Testing Way',
        address2: '',
        city: 'Some City',
        stateOrProvince: 'California',
        stateOrProvinceCode: 'CA',
        country: 'United States',
        countryCode: 'US',
        postalCode: '95555',
        phone: '555-555-5555',
        customFields: [],
    };

    describe('Sepa form fieldset', () => {
        const SepaFormFieldset = checkoutcomCustomFormFields.sepa;
        let component: ReactWrapper;
        const sepaProps = getAPMProps.sepa();

        beforeEach(() => {
            component = mount(
                <CheckoutcomAPMsTest
                    {...sepaProps}
                    cardFieldset={
                        <SepaFormFieldset debtor={billingAddress} method={sepaProps.method} />
                    }
                />,
            );
        });

        it('should render the sepa fieldset', () => {
            expect(component.find('input[name="iban"]')).toHaveLength(1);
            expect(component.find('input[name="sepaMandate"]')).toHaveLength(1);
        });

        it('should call toggleSubmitButton on checkbox checked', () => {
            const checkbox = component.find('input[name="sepaMandate"]');

            checkbox.simulate('change', { target: { name: 'sepaMandate', value: true } });

            expect(paymentForm.disableSubmit).toHaveBeenLastCalledWith(sepaProps.method, false);
        });

        it('should call disableSubmit on useEffect cleanup function', () => {
            component.unmount();

            expect(paymentForm.disableSubmit).toHaveBeenLastCalledWith(sepaProps.method, false);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });
    });

    describe('iDeal', () => {
        const IdealFormFieldset = checkoutcomCustomFormFields.ideal;
        let component: ReactWrapper;

        beforeEach(() => {
            const idealProps = getAPMProps.ideal();

            component = mount(
                <CheckoutcomAPMsTest
                    {...idealProps}
                    cardFieldset={<IdealFormFieldset method={idealProps.method} />}
                />,
            );
        });

        it('Shopper is able to see iDeal Payment Method', () => {
            expect(component.find('input[type="hidden"]')).toHaveLength(1);
        });

        it('Shopper selects an Issuer from dropdown', () => {
            component.find(DropdownTrigger).simulate('click');
            component.find(OptionButton).at(0).simulate('click');

            expect(component.find(HiddenInput).props()).toEqual(
                expect.objectContaining({
                    selectedIssuer: 'INGBNL2A',
                }),
            );
        });
    });

    describe('ccDocument form fieldset', () => {
        const CcDocumentFormFieldset = ccDocumentField;

        it('should render the ideal fieldset', () => {
            const oxxoProps = getAPMProps.oxxo();
            const compoonent = mount(
                <CheckoutcomAPMsTest
                    {...oxxoProps}
                    cardFieldset={<CcDocumentFormFieldset method={oxxoProps.method} />}
                />,
            );

            expect(compoonent.find('input[name="ccDocument"]')).toHaveLength(1);
        });
    });

    describe('Fawry', () => {
        const FawryFormFieldset = checkoutcomCustomFormFields.fawry;

        it('Shopper is able to see Fawry Payment Method', () => {
            const fawryProps = getAPMProps.fawry();
            const component = mount(
                <CheckoutcomAPMsTest
                    {...fawryProps}
                    cardFieldset={<FawryFormFieldset method={fawryProps.method} />}
                />,
            );

            expect(component.find('input[name="customerMobile"]')).toHaveLength(1);
            expect(component.find('input[name="customerEmail"]')).toHaveLength(1);
        });
    });
});
