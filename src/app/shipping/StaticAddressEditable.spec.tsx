import { mount, shallow } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { DynamicFormField, StaticAddress } from '../address/';
import { getAddress } from '../address/address.mock';
import { getFormFields } from '../address/formField.mock';
import { Button } from '../ui/button';

import StaticAddressEditable, { StaticAddressEditableProps } from './StaticAddressEditable';

describe('StaticAddressEditable Component', () => {
    const defaultProps: StaticAddressEditableProps = {
        address: getAddress(),
        buttonId: 'foo',
        formFields: getFormFields(),
        isLoading: false,
        methodId: 'bar',
        initialize: jest.fn(),
        deinitialize: jest.fn(),
        onFieldChange: jest.fn(),
    };

    const initialFormikValues = {
        shippingAddress: {
            customFields: {
                field_25: '',
            },
        },
    };

    it('renders a static address, an edit button, and custom form fields', () => {
        const wrapper = shallow(<StaticAddressEditable { ...defaultProps } />);

        expect(wrapper.find(StaticAddress)).toHaveLength(1);
        expect(wrapper.find(Button)).toHaveLength(1);
        expect(wrapper.find('#customFieldset')).toHaveLength(1);
    });

    it('does not render custom form fields', () => {
        const builtInFormFields = getFormFields().filter(({ custom }) => !custom);
        const wrapper = shallow(<StaticAddressEditable { ...defaultProps } formFields={ builtInFormFields } />);

        expect(wrapper.find(StaticAddress)).toHaveLength(1);
        expect(wrapper.find(Button)).toHaveLength(1);
        expect(wrapper.find('#customFieldset')).toHaveLength(0);
    });

    it('calls initialize prop on mount', () => {
        shallow(<StaticAddressEditable { ...defaultProps } />);

        expect(defaultProps.initialize).toHaveBeenCalled();
    });

    it('calls deinitialize prop on unmount', () => {
        shallow(<StaticAddressEditable { ...defaultProps } />).unmount();

        expect(defaultProps.initialize).toHaveBeenCalled();
    });

    it('renders correct number of custom form fields', () => {
        const component = mount(
            <Formik
                initialValues={ initialFormikValues }
                onSubmit={ noop }
            >
                <StaticAddressEditable { ...defaultProps } />
            </Formik>
        );

        expect(component.find(DynamicFormField)).toHaveLength(3);
    });

    it('calls method to set field value on change in custom form field', () => {
        const component = mount(
            <Formik
                initialValues={ initialFormikValues }
                onSubmit={ noop }
            >
                <StaticAddressEditable { ...defaultProps } />
            </Formik>
        );

        const inputFieldName = getFormFields()[4].name;

        component.find(`input[name="shippingAddress.customFields.${inputFieldName}"]`)
            .simulate('change', { target: { value: 'foo', name: 'shippingAddress.customFields.field_25' } });

        expect(defaultProps.onFieldChange).toHaveBeenCalledWith(inputFieldName, 'foo');
    });
});
