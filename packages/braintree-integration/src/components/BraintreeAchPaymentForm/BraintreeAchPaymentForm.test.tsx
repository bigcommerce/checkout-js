import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { fireEvent, render, screen } from '@testing-library/react';
import { Formik } from 'formik';
import { FormikValues } from 'formik/dist/types';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { CheckoutContext, PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import {
    getBraintreeAchPaymentMethod,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-utils';

import { BraintreeAchBankAccountValues } from '../../validation-schemas';

import BraintreeAchPaymentForm, { BraintreeAchPaymentFormProps } from './BraintreeAchPaymentForm';
import { OwnershipTypes } from './braintreeAchPaymentFormConfig';

describe('BraintreeAchPaymentForm', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: BraintreeAchPaymentFormProps;
    let BraintreeAchPaymentFormTest: FunctionComponent<BraintreeAchPaymentFormProps>;
    let paymentForm: PaymentFormService;
    let initialValues: FormikValues;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        const { language } = createLocaleContext(getStoreConfig());

        defaultProps = {
            method: getBraintreeAchPaymentMethod(),
            checkoutService,
            checkoutState,
            paymentForm,
            language,
            updateMandateText: jest.fn().mockReturnValue('mandate text'),
        };

        jest.spyOn(checkoutService.getState().data, 'getBillingAddress').mockReturnValue({
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
        });

        jest.spyOn(checkoutService.getState().data, 'getBillingCountries').mockReturnValue([
            {
                code: 'US',
                name: 'United States',
                hasPostalCodes: true,
                requiresState: true,
                subdivisions: [
                    { code: 'CA', name: 'California' },
                    { code: 'TX', name: 'Texas' },
                ],
            },
        ]);

        BraintreeAchPaymentFormTest = (props: BraintreeAchPaymentFormProps) => {
            return (
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                        <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                            <BraintreeAchPaymentForm {...props} />
                        </CheckoutContext.Provider>
                    </LocaleContext.Provider>
                </Formik>
            );
        };
    });

    it('should render form', () => {
        render(<BraintreeAchPaymentFormTest {...defaultProps} />);

        expect(screen.getByTestId('checkout-ach-form')).toBeInTheDocument();
    });

    it('should only contain formFields for OwnershipTypes.Personal', () => {
        const eventData = {
            target: {
                value: OwnershipTypes.Personal,
                name: BraintreeAchBankAccountValues.OwnershipType,
            },
        };

        jest.spyOn(paymentForm, 'getFieldValue').mockImplementation((field) => {
            if (field === 'ownershipType') {
                return eventData.target.value;
            }
        });

        render(<BraintreeAchPaymentFormTest {...defaultProps} />);

        expect(screen.getByText('First Name')).toBeInTheDocument();
        expect(screen.getByText('Last Name')).toBeInTheDocument();
        expect(screen.queryByText('Business Name')).not.toBeInTheDocument();
    });

    it('should only contain formFields for OwnershipTypes.Business', () => {
        const eventData = {
            target: {
                value: OwnershipTypes.Business,
                name: BraintreeAchBankAccountValues.OwnershipType,
            },
        };

        jest.spyOn(paymentForm, 'getFieldValue').mockImplementation((field) => {
            if (field === 'ownershipType') {
                return eventData.target.value;
            }
        });

        render(<BraintreeAchPaymentFormTest {...defaultProps} />);

        const select = screen.getByRole('combobox', { name: 'Ownership Type' });

        fireEvent.change(select, eventData);

        expect(paymentForm.setFieldValue).toHaveBeenCalledWith(
            eventData.target.name,
            eventData.target.value,
        );

        expect(screen.getByText('Business Name')).toBeInTheDocument();
        expect(screen.queryByText('First Name')).not.toBeInTheDocument();
        expect(screen.queryByText('Last Name')).not.toBeInTheDocument();
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        jest.spyOn(checkoutState.statuses, 'isLoadingBillingCountries').mockReturnValue(true);

        const { rerender } = render(<BraintreeAchPaymentFormTest {...defaultProps} />);

        // eslint-disable-next-line testing-library/no-node-access
        expect(screen.queryByTestId('checkout-ach-form').parentElement).toHaveStyle(
            'display: none',
        );

        jest.spyOn(checkoutState.statuses, 'isLoadingBillingCountries').mockReturnValue(false);

        rerender(<BraintreeAchPaymentFormTest {...defaultProps} />);

        // eslint-disable-next-line testing-library/no-node-access
        expect(screen.queryByTestId('checkout-ach-form').parentElement).toHaveStyle(
            'display: block',
        );
    });

    it('hides content while loading', () => {
        jest.spyOn(checkoutState.statuses, 'isLoadingBillingCountries').mockReturnValue(true);

        render(<BraintreeAchPaymentFormTest {...defaultProps} />);

        // eslint-disable-next-line testing-library/no-node-access
        expect(screen.queryByTestId('checkout-ach-form').parentElement).toHaveStyle(
            'display: none',
        );
    });
});
