import { createLanguageService, FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import React from 'react';

import { LocaleContext, LocaleContextType, TranslatedString } from '@bigcommerce/checkout/locale';

import { FormField } from '../FormField';

import CheckboxGroupFormField from './CheckboxGroupFormField';
import DynamicFormField from './DynamicFormField';
import DynamicInput from './DynamicInput';

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
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField
                        extraClass="dynamic-form-field--addressLine1"
                        field={formFields.find(({ name }) => name === 'address1') as FormFieldType}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find('.dynamic-form-field').prop('className')).toContain(
            'dynamic-form-field--addressLine1',
        );
    });

    it('renders FormField with expected props', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField
                        field={formFields.find(({ name }) => name === 'address1') as FormFieldType}
                        onChange={onChange}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find(FormField).props()).toEqual(
            expect.objectContaining({
                onChange,
                name: 'address1',
            }),
        );
    });

    it('renders telephone field', () => {
        const telField: FormFieldType = {
            custom: false,
            fieldType: 'text',
            id: 'field_17',
            label: 'Phone Number',
            name: 'phone',
            required: true,
            type: 'string',
        };
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField field={telField} />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find(DynamicInput).props()).toEqual(
            expect.objectContaining({
                id: 'phone',
                fieldType: 'tel',
            }),
        );
    });

    it('renders DynamicInput with expected props', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField
                        autocomplete="address-line1"
                        field={formFields.find(({ name }) => name === 'address1') as FormFieldType}
                        inputId="addressLine1Input"
                        onChange={onChange}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find(DynamicInput).props()).toEqual(
            expect.objectContaining({
                autoComplete: 'address-line1',
                id: 'addressLine1Input',
            }),
        );
    });

    it('renders CheckboxGroupFormField if fieldType is checkbox', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField
                        field={{
                            ...(formFields.find(
                                ({ name }) => name === 'field_27',
                            ) as FormFieldType),
                            fieldType: 'checkbox',
                        }}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find(CheckboxGroupFormField)).toHaveLength(1);
    });

    it('renders label', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField
                        field={formFields.find(({ name }) => name === 'address1') as FormFieldType}
                        label={<TranslatedString id="address.address_line_1_label" />}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find(TranslatedString).prop('id')).toBe('address.address_line_1_label');

        expect(component.find('.optimizedCheckout-contentSecondary')).toHaveLength(0);
    });

    it('renders `optional` label when field is not required', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <DynamicFormField
                        field={formFields.find(({ name }) => name === 'address2') as FormFieldType}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(
            component.find('.optimizedCheckout-contentSecondary').find(TranslatedString).prop('id'),
        ).toBe('common.optional_text');
    });
});
