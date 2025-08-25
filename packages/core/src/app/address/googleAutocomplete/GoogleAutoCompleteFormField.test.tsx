import { type FormField } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getFormFields } from '../formField.mock';

import GoogleAutocompleteFormField, { type GoogleAutocompleteFormFieldProps } from './GoogleAutocompleteFormField';

describe('GoogleAutocompleteFormField', () => {
    let defaultProps: GoogleAutocompleteFormFieldProps;
    let addressField: FormField;

    beforeEach(() => {
        addressField = getFormFields().find((field) => field.name === 'address1') as unknown as FormField;

        defaultProps = {
            apiKey: 'test-api-key',
            countryCode: 'US',
            supportedCountries: ['US'],
            onSelect: jest.fn(),
            onChange: jest.fn(),
            field: addressField,
        };
    });

    it('renders the input field', () => {
        render(
            <Formik initialValues={{}} onSubmit={jest.fn()}>
                <GoogleAutocompleteFormField {...defaultProps} />
            </Formik>
        );

        const inputElement = screen.getByPlaceholderText(/NO PO BOX/i);

        expect(inputElement).toBeInTheDocument();
    });

    it('calls onSelect when a place is selected', async () => {
        render(
            <Formik
                initialValues={{ address1: '' }}
                onSubmit={jest.fn()}
            >
                {({ setFieldValue }) => (
                    <GoogleAutocompleteFormField
                        {...defaultProps}
                        onChange={(value) => setFieldValue('address1', value)}
                    />
                )}
            </Formik>
        );

        const inputElement: HTMLInputElement = screen.getByPlaceholderText(/NO PO BOX/i);

        await userEvent.type(inputElement, '123 Main St');
        await userEvent.tab();

        expect(inputElement.value).toBe('123 Main St');
    });

    it('renders input and limits value to max length', async () => {
        const maxLengthField = {
            ...addressField,
            maxLength: 50,
        };

        render(
            <Formik
                initialValues={{ address1: '' }}
                onSubmit={jest.fn()}
            >
                {({ setFieldValue }) => (
                    <GoogleAutocompleteFormField
                        {...defaultProps}
                        field={maxLengthField}
                        onChange={(value) => setFieldValue('address1', value)}
                    />
                )}
            </Formik>
        );

        const inputElement: HTMLInputElement = screen.getByPlaceholderText(/NO PO BOX/i);

        await userEvent.type(
            inputElement,
            '120 South Jean Baptiste Point du Sable Lake Shore Drive',
        );

        expect(inputElement.value).toBe('120 South Jean Baptiste Point du Sable Lake Shore ');
    });
});
