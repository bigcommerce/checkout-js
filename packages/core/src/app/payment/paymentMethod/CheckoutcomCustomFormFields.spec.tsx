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

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, FormContextType } from '@bigcommerce/checkout/ui';

import { getBillingAddress } from '../../billing/billingAddresses.mock';
import { getCart } from '../../cart/carts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { getConsignment } from '../../shipping/consignment.mock';
import { DropdownTrigger } from '../../ui/dropdown';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import checkoutcomCustomFormFields, {
    ccDocumentField,
    HiddenInput,
    OptionButton,
} from './CheckoutcomCustomFormFields';
import CreditCardPaymentMethod, {
    CreditCardPaymentMethodProps,
    CreditCardPaymentMethodValues,
} from './CreditCardPaymentMethod';

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
    let defaultProps: jest.Mocked<
        Omit<CreditCardPaymentMethodProps, 'cardFieldset' | 'cardValidationSchema' | 'method'>
    >;
    let formContext: FormContextType;
    let initialValues: CreditCardPaymentMethodValues;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;
    let subscribeEventEmitter: EventEmitter;
    let CheckoutcomAPMsTest: FunctionComponent<
        Omit<
            CreditCardPaymentMethodProps,
            'cardValidationSchema' | 'deinitializePayment' | 'initializePayment'
        >
    >;

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
                <CheckoutProvider checkoutService={checkoutService}>
                    <PaymentContext.Provider value={paymentContext}>
                        <LocaleContext.Provider value={localeContext}>
                            <FormContext.Provider value={formContext}>
                                <Formik initialValues={initialValues} onSubmit={noop}>
                                    <CreditCardPaymentMethod {...defaultProps} {...props} />
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
        let component: ReactWrapper;
        const sepaProps = getAPMProps.sepa();

        beforeEach(() => {
            component = mount(
                <CheckoutcomAPMsTest
                    {...sepaProps}
                    cardFieldset={
                        <SepaFormFieldset debtor={getBillingAddress()} method={sepaProps.method} />
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

            expect(paymentContext.disableSubmit).toHaveBeenLastCalledWith(sepaProps.method, false);
        });

        it('should call disableSubmit on useEffect cleanup function', () => {
            component.unmount();

            expect(paymentContext.disableSubmit).toHaveBeenLastCalledWith(sepaProps.method, false);
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
