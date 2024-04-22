import '@testing-library/jest-dom';
import { CheckoutService, createCheckoutService, FormField } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';

import AddressForm, { AddressFormProps } from './AddressForm';
import { getFormFields } from './formField.mock';


describe('AddressForm Component', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;
    let formFields: FormField[];

    const renderAddressFormComponent = (addressFormProps: AddressFormProps): void => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <AddressForm { ...addressFormProps } />
                </Formik>
            </LocaleContext.Provider>
        );
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());
        formFields = getFormFields();

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());
    });

    it('renders address form with provided fields list', () => {
        renderAddressFormComponent({
            fieldName: 'address',
            formFields,
        });

        expect(screen.getByText('First Name')).toBeInTheDocument();
        expect(screen.getByText('Last Name')).toBeInTheDocument();
        expect(screen.getByText('Address')).toBeInTheDocument();
        expect(screen.getByText('Apartment/Suite/Building')).toBeInTheDocument();
        expect(screen.getByText('Custom message')).toBeInTheDocument();
        expect(screen.getByText('Custom dropdown')).toBeInTheDocument();
        expect(screen.getByText('Custom number')).toBeInTheDocument();
        expect(formFields.length).toEqual(7);
    });

    it('renders address form with save address checkbox', () => {
        renderAddressFormComponent({
            formFields,
            shouldShowSaveAddress: true,
        });

        expect(screen.getByText('Save this address in my address book.')).toBeInTheDocument();
    });

    it('renders google autocomplete address field instead of default address field', () => {
        renderAddressFormComponent({
            formFields,
            countryCode: 'US',
            googleMapsApiKey: 'googleMapsApiKeyMock',
            countriesWithAutocomplete: ['US'],
        });

        expect(screen.getByTestId('google-autocomplete-form-field')).toBeInTheDocument();
    });

    it('updates field with new value', async () => {
        const onChange = jest.fn();
        const fieldValue = 'test';
        const fieldId = 'firstName';

        renderAddressFormComponent({ formFields, onChange });

        await userEvent.click(screen.getByTestId(`${fieldId}Input-text`));
        await userEvent.keyboard(fieldValue);

        expect(onChange).toHaveBeenCalledWith(fieldId, fieldValue);
    });
});
