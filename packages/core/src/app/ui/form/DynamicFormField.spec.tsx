import { createCheckoutService, FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import { mount, shallow } from 'enzyme';
import { Formik } from 'formik';
import React from 'react';

import { LocaleProvider, TranslatedString } from '@bigcommerce/checkout/locale';

import { getFormFields } from '../../address/formField.mock';

import CheckboxGroupFormField from './CheckboxGroupFormField';
import DynamicFormField, { DynamicFormFieldProps } from './DynamicFormField';
import DynamicInput from './DynamicInput';
import FormField from './FormField';

describe('DynamicFormField Component', () => {
    const formFields = getFormFields();
    const onChange = jest.fn();
    let DynamicFormFieldTest: FunctionComponent<DynamicFormFieldProps>;

    beforeEach(() => {
        const checkoutService = createCheckoutService();

        DynamicFormFieldTest = (props) => <LocaleProvider checkoutService={checkoutService}>
            <Formik initialValues={{}} onSubmit={jest.fn()}>
                <DynamicFormField {...props} />
            </Formik>
        </LocaleProvider>
    })

    it('renders legacy class name', () => {
        const component = shallow(
            <DynamicFormField
                extraClass="dynamic-form-field--addressLine1"
                field={formFields.find(({ name }) => name === 'address1') as FormFieldType}
            />,
        );

        expect(component.find('.dynamic-form-field').prop('className')).toContain(
            'dynamic-form-field--addressLine1',
        );
    });

    it('renders FormField with expected props', () => {
        const component = mount(
            <DynamicFormFieldTest
                field={formFields.find(({ name }) => name === 'address1') as FormFieldType}
                onChange={onChange}
            />,
        );

        expect(component.find(FormField).props()).toEqual(
            expect.objectContaining({
                onChange,
                name: 'address1',
            }),
        );
    });

    it('renders telephone field', () => {
        const telField = {
            custom: false,
            fieldType: 'text',
            id: 'field_17',
            label: 'Phone Number',
            name: 'phone',
            required: true,
            type: 'string',
        };
        const component = mount(
            <DynamicFormFieldTest field={telField as FormFieldType} />,
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
            <DynamicFormFieldTest
                autocomplete="address-line1"
                field={formFields.find(({ name }) => name === 'address1') as FormFieldType}
                inputId="addressLine1Input"
                onChange={onChange}
            />,
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
            <DynamicFormFieldTest
                field={{
                    ...(formFields.find(({ name }) => name === 'field_27') as FormFieldType),
                    fieldType: 'checkbox',
                }}
            />,
        );

        expect(component.find(CheckboxGroupFormField)).toHaveLength(1);
    });

    it('renders label', () => {
        const component = mount(
            <DynamicFormFieldTest
                field={formFields.find(({ name }) => name === 'address1') as FormFieldType}
                label={<TranslatedString id="address.address_line_1_label" />}
            />,
        );

        expect(component.find(TranslatedString).prop('id')).toBe('address.address_line_1_label');

        expect(component.find('.optimizedCheckout-contentSecondary')).toHaveLength(0);
    });

    it('renders `optional` label when field is not required', () => {
        const component = mount(
            <DynamicFormFieldTest
                field={formFields.find(({ name }) => name === 'address2') as FormFieldType}
            />,
        );

        expect(
            component.find('.optimizedCheckout-contentSecondary').find(TranslatedString).prop('id'),
        ).toBe('common.optional_text');
    });
});
