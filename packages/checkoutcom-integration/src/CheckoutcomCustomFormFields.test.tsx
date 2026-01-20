import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { EventEmitter } from 'events';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    CheckoutContext,
    LocaleContext,
    type LocaleContextType,
    PaymentFormContext,
    type PaymentFormService,
} from '@bigcommerce/checkout/contexts';
import {
    CreditCardPaymentMethodComponent,
    type CreditCardPaymentMethodProps,
    type CreditCardPaymentMethodValues,
} from '@bigcommerce/checkout/credit-card-integration';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getConsignment,
    getCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import checkoutcomCustomFormFields, { ccDocumentField } from './CheckoutcomCustomFormFields';

const getAPMProps = {
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
        const sepaProps = getAPMProps.sepa();
        const user = userEvent.setup();

        it('should render the sepa fieldset', () => {
            render(
                <CheckoutcomAPMsTest
                    {...sepaProps}
                    cardFieldset={
                        <SepaFormFieldset debtor={billingAddress} method={sepaProps.method} />
                    }
                />,
            );
            expect(
                screen.getByText(localeContext.language.translate('payment.sepa_account_number')),
            ).toBeInTheDocument();

            expect(
                screen.getByText(
                    localeContext.language.translate(
                        'payment.checkoutcom_sepa_mandate_disclaimer',
                        { creditorName: 'sepaCreditorCompanyName' },
                    ),
                ),
            ).toBeInTheDocument();
        });

        it('renders form with initial values', () => {
            render(
                <CheckoutcomAPMsTest
                    {...sepaProps}
                    cardFieldset={
                        <SepaFormFieldset debtor={billingAddress} method={sepaProps.method} />
                    }
                />,
            );

            expect(paymentForm.disableSubmit).toHaveBeenLastCalledWith(sepaProps.method, true);
        });

        it('submit button is toggled when user checks permission checkbox', async () => {
            render(
                <CheckoutcomAPMsTest
                    {...sepaProps}
                    cardFieldset={
                        <SepaFormFieldset debtor={billingAddress} method={sepaProps.method} />
                    }
                />,
            );

            const permissionChangeCheckbox = screen.getByText(
                localeContext.language.translate('payment.checkoutcom_sepa_mandate_disclaimer', {
                    creditorName: 'sepaCreditorCompanyName',
                }),
            );

            await user.click(permissionChangeCheckbox);
            expect(paymentForm.disableSubmit).toHaveBeenLastCalledWith(sepaProps.method, false);
            await user.click(permissionChangeCheckbox);
            expect(paymentForm.disableSubmit).toHaveBeenLastCalledWith(sepaProps.method, true);
        });

        it('submit button should be disabled on useEffect cleanup function', () => {
            render(
                <CheckoutcomAPMsTest
                    {...sepaProps}
                    cardFieldset={
                        <SepaFormFieldset debtor={billingAddress} method={sepaProps.method} />
                    }
                />,
            ).unmount();
            expect(paymentForm.disableSubmit).toHaveBeenLastCalledWith(sepaProps.method, false);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });
    });

    describe('ccDocument form fieldset', () => {
        const CcDocumentFormFieldset = ccDocumentField;

        it('should render the oxxo fieldset', () => {
            const oxxoProps = getAPMProps.oxxo();

            expect(
                screen.queryByText(
                    localeContext.language.translate('payment.checkoutcom_document_label_oxxo'),
                ),
            ).not.toBeInTheDocument();
            render(
                <CheckoutcomAPMsTest
                    {...oxxoProps}
                    cardFieldset={<CcDocumentFormFieldset method={oxxoProps.method} />}
                />,
            );
            expect(
                screen.getByText(
                    localeContext.language.translate('payment.checkoutcom_document_label_oxxo'),
                ),
            ).toBeInTheDocument();
        });
    });

    describe('Fawry', () => {
        const FawryFormFieldset = checkoutcomCustomFormFields.fawry;

        it('Shopper is able to see Fawry Payment Method', () => {
            const fawryProps = getAPMProps.fawry();

            render(
                <CheckoutcomAPMsTest
                    {...fawryProps}
                    cardFieldset={<FawryFormFieldset method={fawryProps.method} />}
                />,
            );
            expect(
                screen.getByText(
                    localeContext.language.translate(
                        'payment.checkoutcom_fawry_customer_mobile_label',
                    ),
                ),
            ).toBeInTheDocument();

            expect(
                screen.getByText(
                    localeContext.language.translate(
                        'payment.checkoutcom_fawry_customer_email_label',
                    ),
                ),
            ).toBeInTheDocument();
        });
    });
});
