import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { FormikValues } from 'formik/dist/types';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    CheckoutContext,
    PaymentFormContext,
    PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getBraintreeAchPaymentMethod,
    getCart,
    getCheckout,
    getCustomer,
    getInstruments,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { act, render, screen } from '@bigcommerce/checkout/test-utils';

import { AccountTypes, OwnershipTypes } from '../constants';

import BraintreeAchPaymentForm, { BraintreeAchPaymentFormProps } from './BraintreeAchPaymentForm';

describe('BraintreeAchPaymentForm', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: BraintreeAchPaymentFormProps;
    let BraintreeAchPaymentFormTest: FunctionComponent<BraintreeAchPaymentFormProps>;
    let paymentForm: PaymentFormService;
    let initialValues: FormikValues;

    const method = getBraintreeAchPaymentMethod();
    const methodWithVaulting = {
        ...method,
        config: {
            ...method.config,
            isVaultingEnabled: true,
        },
    };

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

    const defaultFormValues = {
        paymentProviderRadio: '', // legacy prop -> added due to the PaymentFormValues interface
        ownershipType: OwnershipTypes.Personal,
        accountType: AccountTypes.Savings,
        accountNumber: '',
        routingNumber: '',
        businessName: '',
        firstName: billingAddress.firstName,
        lastName: billingAddress.lastName,
        shouldSaveInstrument: false,
        shouldSetAsDefaultInstrument: false,
        instrumentId: '',
        orderConsent: false,
    };

    const validFormWithPersonalData = {
        paymentProviderRadio: '', // legacy prop -> added due to the PaymentFormValues interface
        ownershipType: OwnershipTypes.Personal,
        accountType: AccountTypes.Savings,
        accountNumber: '100000000',
        routingNumber: '100000012',
        businessName: '',
        firstName: 'John',
        lastName: 'Doe',
        shouldSaveInstrument: false,
        shouldSetAsDefaultInstrument: false,
        instrumentId: '',
        orderConsent: false,
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        defaultProps = {
            method: methodWithVaulting,
            updateMandateText: jest.fn().mockReturnValue('mandate text'),
        };

        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(billingAddress);
        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        initialValues = defaultFormValues;

        BraintreeAchPaymentFormTest = (props: BraintreeAchPaymentFormProps) => {
            return (
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                        <PaymentFormContext.Provider value={{ paymentForm }}>
                            <BraintreeAchPaymentForm {...props} />
                        </PaymentFormContext.Provider>
                    </CheckoutContext.Provider>
                </Formik>
            );
        };
    });

    it('renders form with prefilled values', async () => {
        jest.spyOn(paymentForm, 'getFormValues').mockReturnValue(defaultFormValues);
        jest.spyOn(paymentForm, 'setFieldValue');

        render(<BraintreeAchPaymentFormTest {...defaultProps} />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        const ownershipTypeField = screen.getByTestId<HTMLInputElement>('ownershipType-select');
        const firstNameField = screen.getByTestId<HTMLInputElement>('firstName-text');
        const lastNameField = screen.getByTestId<HTMLInputElement>('lastName-text');

        expect(ownershipTypeField.value).toBe(OwnershipTypes.Personal);
        expect(firstNameField.value).toBe(billingAddress.firstName);
        expect(lastNameField.value).toBe(billingAddress.lastName);
    });

    it('renders mandate text after form fields filled', async () => {
        jest.spyOn(paymentForm, 'getFormValues').mockReturnValue(validFormWithPersonalData);
        jest.spyOn(paymentForm, 'setFieldValue');

        render(<BraintreeAchPaymentFormTest {...defaultProps} />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(screen.getByTestId('mandate-text')).toBeInTheDocument();
    });

    it('disables submit button if mandate text is not checked', async () => {
        jest.spyOn(paymentForm, 'getFormValues').mockReturnValue(validFormWithPersonalData);
        jest.spyOn(paymentForm, 'disableSubmit');
        jest.spyOn(paymentForm, 'getFieldValue').mockImplementation((fieldName: string) => {
            return fieldName === 'orderConsent' && false;
        });

        render(<BraintreeAchPaymentFormTest {...defaultProps} />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(paymentForm.disableSubmit).toHaveBeenCalledWith(methodWithVaulting, true);
    });

    it('removes disable state from submit button when form is valid and mandate text is checked', () => {
        jest.spyOn(paymentForm, 'getFormValues').mockReturnValue(defaultFormValues);
        jest.spyOn(paymentForm, 'disableSubmit');
        jest.spyOn(paymentForm, 'getFieldValue').mockImplementation((fieldName: string) => {
            return fieldName === 'orderConsent';
        });

        render(<BraintreeAchPaymentFormTest {...defaultProps} />);

        expect(paymentForm.disableSubmit).toHaveBeenCalledWith(methodWithVaulting, false);
    });

    it('shows save instrument checkbox for registered customers', () => {
        jest.spyOn(paymentForm, 'getFormValues').mockReturnValue(defaultFormValues);

        render(<BraintreeAchPaymentFormTest {...defaultProps} />);

        expect(screen.getByText('Save this account for future transactions')).toBeInTheDocument();
    });

    it('renders vaulting instruments select', async () => {
        const allInstruments = getInstruments();
        const achInstruments = allInstruments.filter((instrument) => instrument.method === 'ach');

        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(achInstruments);
        jest.spyOn(paymentForm, 'getFormValues').mockReturnValue(defaultFormValues);

        render(<BraintreeAchPaymentFormTest {...defaultProps} />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(screen.getByTestId('account-instrument-fieldset')).toBeInTheDocument();
        expect(screen.getByText('Account number ending in: 0000')).toBeInTheDocument();
        expect(screen.getByText('Routing Number: 011000015')).toBeInTheDocument();
    });

    it('renders form and a description if selected vaulting instrument needs to be confirmed (trusted shipping address is false)', async () => {
        const allInstruments = getInstruments();
        const achInstruments = allInstruments.filter((instrument) => instrument.method === 'ach');

        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(achInstruments);
        jest.spyOn(paymentForm, 'getFormValues').mockReturnValue(defaultFormValues);

        render(<BraintreeAchPaymentFormTest {...defaultProps} />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(screen.getByTestId('account-instrument-fieldset')).toBeInTheDocument();
        expect(
            screen.getByText('Please re-enter your account data to authorize this transaction.'),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'This additional security step is applied to your account when shipping to an address for the first time or if the shipping address was edited recently.',
            ),
        ).toBeInTheDocument();
        expect(screen.getByText('Routing Number')).toBeInTheDocument();
        expect(screen.getByText('Account Number')).toBeInTheDocument();
    });

    it('does not render mandate text for vaulting instrument confirmation', async () => {
        const allInstruments = getInstruments();
        const achInstruments = allInstruments.filter((instrument) => instrument.method === 'ach');

        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(achInstruments);
        jest.spyOn(paymentForm, 'getFormValues').mockReturnValue(validFormWithPersonalData);
        jest.spyOn(paymentForm, 'setFieldValue');

        render(<BraintreeAchPaymentFormTest {...defaultProps} />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(screen.getByTestId('account-instrument-fieldset')).toBeInTheDocument();
        expect(screen.queryByTestId('mandate-text')).not.toBeInTheDocument();
    });
});
