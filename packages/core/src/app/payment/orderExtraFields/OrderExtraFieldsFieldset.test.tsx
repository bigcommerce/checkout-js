import { type FormField } from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../../config/config.mock';

import OrderExtraFieldsFieldset from './OrderExtraFieldsFieldset';

describe('OrderExtraFieldsFieldset', () => {
    const localeContext: LocaleContextType = createLocaleContext(getStoreConfig());

    const extraField: FormField = {
        custom: false,
        default: '',
        id: 'b2bExtraField_100',
        label: 'PO Number',
        name: 'b2bExtraField_100',
        required: true,
        fieldType: 'text',
        type: 'string',
    } as FormField;

    const anotherExtraField: FormField = {
        custom: false,
        default: '',
        id: 'b2bExtraField_200',
        label: 'Order Notes',
        name: 'b2bExtraField_200',
        required: true,
        fieldType: 'text',
        type: 'string',
    } as FormField;

    const nonExtraField: FormField = {
        custom: false,
        default: '',
        id: 'firstName',
        label: 'First Name',
        name: 'firstName',
        required: true,
        fieldType: 'text',
        type: 'string',
    } as FormField;

    const dropdownExtraField: FormField = {
        custom: false,
        default: '',
        id: 'b2bExtraField_300',
        label: 'Shipping Priority',
        name: 'b2bExtraField_300',
        required: true,
        fieldType: 'dropdown',
        type: 'string',
        options: {
            items: [
                { value: 'high', label: 'High' },
                { value: 'low', label: 'Low' },
            ],
        },
    } as FormField;

    const renderFieldset = (formFields: FormField[]) =>
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{ orderExtraFields: {} }} onSubmit={noop}>
                    <OrderExtraFieldsFieldset formFields={formFields} />
                </Formik>
            </LocaleContext.Provider>,
        );

    it('renders a DynamicFormField for each extra field', () => {
        renderFieldset([extraField, anotherExtraField]);

        expect(screen.getByTestId('order-extra-fields')).toBeInTheDocument();
        expect(screen.getByText('PO Number')).toBeInTheDocument();
        expect(screen.getByText('Order Notes')).toBeInTheDocument();
    });

    it('filters out non-extra fields', () => {
        renderFieldset([extraField, nonExtraField]);

        expect(screen.getByText('PO Number')).toBeInTheDocument();
        expect(screen.queryByText('First Name')).not.toBeInTheDocument();
    });

    it('returns null when no extra fields are provided', () => {
        renderFieldset([nonExtraField]);

        expect(screen.queryByTestId('order-extra-fields')).not.toBeInTheDocument();
    });

    it('returns null when the form fields array is empty', () => {
        renderFieldset([]);

        expect(screen.queryByTestId('order-extra-fields')).not.toBeInTheDocument();
    });

    it('renders translated placeholder as first option of dropdown extra field', () => {
        renderFieldset([dropdownExtraField]);

        const options = screen.getAllByRole('option');

        expect(options[0]).toHaveTextContent('Please Select');
        expect(options[0]).toHaveValue('');
        expect(options).toHaveLength(3);
    });

    it('does not render placeholder for non-dropdown extra fields', () => {
        renderFieldset([extraField]);

        expect(screen.queryByText('Please Select')).not.toBeInTheDocument();
    });
});
