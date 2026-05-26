import { createLanguageService, type FormField } from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import OrderExtraFieldsFieldset from './OrderExtraFieldsFieldset';

describe('OrderExtraFieldsFieldset', () => {
    const localeContext: LocaleContextType = { language: createLanguageService() };

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
});
