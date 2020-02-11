import { FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { getFormFields } from './formField.mock';
import AddressFormField from './AddressFormField';
import DynamicFormField from './DynamicFormField';
import DynamicFormFieldType from './DynamicFormFieldType';

describe('AddressFormField Component', () => {
    const formFields = getFormFields();
    const onChange = jest.fn();

    it('renders DynamicFormField Component', () => {
        const component = mount(
            <Formik
                initialValues={ {} }
                onSubmit={ noop }
            >
                <AddressFormField
                    field={ formFields.find(({ name }) => name === 'address1') as FormFieldType }
                    onChange={ onChange }
                />
            </Formik>
        );

        expect(component.find(DynamicFormField).length).toBe(1);
    });

    it('renders DynamicFormField with correct props', () => {
        const component = mount(
            <Formik initialValues={ {} } onSubmit={ noop }>
                <AddressFormField
                    field={ formFields.find(({ name }) => name === 'field_25') as FormFieldType }
                    onChange={ onChange }
                    parentFieldName="shippingAddress.customFields"
                    placeholder="foo"
                />
            </Formik>
        );

        expect(component.find(DynamicFormField).props())
            .toEqual(expect.objectContaining({
               fieldType: DynamicFormFieldType.text,
               parentFieldName: 'shippingAddress.customFields',
               placeholder: 'foo',
            }));

        expect(component.find(DynamicFormField).at(0).prop('field')).toEqual(
            expect.objectContaining({
                id: 'field_25',
            })
        );
    });
});
