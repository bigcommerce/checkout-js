import { createLanguageService, type FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import React from 'react';

import {
    LocaleContext,
    type LocaleContextType,
    TranslatedString,
} from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import DynamicFormField from './DynamicFormField';

describe('DynamicFormField Component', () => {
    const localeContext: LocaleContextType = { language: createLanguageService() };
    const formFields: FormFieldType[] = [
        {
            custom: false,
            default: 'NO PO BOX',
            id: 'field_18',
            label: 'Address Line 1',
            name: 'address1',
            required: true,
        },
        {
            custom: false,
            default: '',
            id: 'field_19',
            label: 'Address Line 2',
            name: 'address2',
            required: false,
        },
        {
            custom: true,
            default: '',
            fieldType: 'dropdown',
            id: 'field_27',
            label: 'Custom dropdown',
            name: 'field_27',
            options: {
                items: [
                    {
                        value: '0',
                        label: 'Foo',
                    },
                    {
                        value: '1',
                        label: 'Bar',
                    },
                ],
            },
            required: false,
            type: 'array',
        },
    ];
    const onChange = jest.fn();

    it('renders legacy class name', () => {
        const { container } = render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField
                        extraClass="dynamic-form-field--addressLine1"
                        field={formFields.find(({ name }) => name === 'address1') as FormFieldType}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.dynamic-form-field--addressLine1')).toBeInTheDocument();
    });

    it('renders FormField with expected props', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField
                        field={formFields.find(({ name }) => name === 'address1') as FormFieldType}
                        onChange={onChange}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('Address Line 1')).toBeInTheDocument();
        expect(screen.getByText('Address Line 1')).toHaveAttribute('for', 'address1');
    });

    it('renders label', () => {
        const { container } = render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField
                        field={formFields.find(({ name }) => name === 'address1') as FormFieldType}
                        label={<TranslatedString id="address.address_line_1_label" />}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(
            screen.getByText(localeContext.language.translate('address.address_line_1_label')),
        ).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.optimizedCheckout-contentSecondary')).toBeNull();
    });

    it('renders `optional` label when field is not required', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField
                        field={formFields.find(({ name }) => name === 'address2') as FormFieldType}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(
            screen.getByText(localeContext.language.translate('common.optional_text')),
        ).toBeInTheDocument();
    });
});
