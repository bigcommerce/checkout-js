import { FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import { mount, shallow } from 'enzyme';
import { Formik } from 'formik';
import React from 'react';

import { getFormFields } from '../../address/formField.mock';
import { TranslatedString } from '../../locale';

import CheckboxGroupFormField from './CheckboxGroupFormField';
import DynamicFormField from './DynamicFormField';
import DynamicInput from './DynamicInput';
import FormField from './FormField';

describe('DynamicFormField Component', () => {
    const formFields = getFormFields();
    const onChange = jest.fn();

    it('renders legacy class name', () => {
        const component = shallow(
            <DynamicFormField
                extraClass="dynamic-form-field--addressLine1"
                field={ formFields.find(({ name }) => name === 'address1') as FormFieldType }
            />
        );

        expect(component.find('.dynamic-form-field').prop('className'))
            .toContain('dynamic-form-field--addressLine1');
    });

    it('renders FormField with expected props', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ jest.fn() }>
                <DynamicFormField
                    field={ formFields.find(({ name }) => name === 'address1') as FormFieldType }
                    onChange={ onChange }
                />
            </Formik>
        );

        expect(component.find(FormField).props())
            .toEqual(expect.objectContaining({
                onChange,
                name: 'address1',
            }));
    });

    it('renders DynamicInput with expected props', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ jest.fn() }>
                <DynamicFormField
                    autocomplete="address-line1"
                    field={ formFields.find(({ name }) => name === 'address1') as FormFieldType }
                    inputId="addressLine1Input"
                    onChange={ onChange }
                />
            </Formik>
        );

        expect(component.find(DynamicInput).props())
            .toEqual(expect.objectContaining({
                autoComplete: 'address-line1',
                id: 'addressLine1Input',
            }));
    });

    it('renders CheckboxGroupFormField if fieldType is checkbox', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ jest.fn() }>
                <DynamicFormField
                    field={ {
                        ...formFields.find(({ name }) => name === 'field_27') as FormFieldType,
                        fieldType: 'checkbox',
                    } }
                />
            </Formik>
        );

        expect(component.find(CheckboxGroupFormField).length).toEqual(1);
    });

    it('renders label', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ jest.fn() }>
                <DynamicFormField
                    field={ formFields.find(({ name }) => name === 'address1') as FormFieldType }
                    label={ <TranslatedString id="address.address_line_1_label" /> }
                />
            </Formik>
        );

        expect(component.find(TranslatedString).prop('id'))
            .toEqual('address.address_line_1_label');

        expect(component.find('.optimizedCheckout-contentSecondary').length).toEqual(0);
    });

    it('renders `optional` label when field is not required', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ jest.fn() }>
                <DynamicFormField
                    field={ formFields.find(({ name }) => name === 'address2') as FormFieldType }
                />
            </Formik>
        );

        expect(component.find('.optimizedCheckout-contentSecondary').find(TranslatedString).prop('id'))
            .toEqual('common.optional_text');
    });
});
