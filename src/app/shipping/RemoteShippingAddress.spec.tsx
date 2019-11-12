import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { DynamicFormField } from '../address';
import { getFormFields } from '../address/formField.mock';

import { getShippingAddress } from './shipping-addresses.mock';
import RemoteShippingAddress, { RemoteShippingAddressProps } from './RemoteShippingAddress';

describe('RemoteShippingAddress Component', () => {
    let component: ReactWrapper;
    const defaultProps: RemoteShippingAddressProps = {
        formFields: getFormFields(),
        containerId: 'container',
        methodId: 'amazon',
        shippingAddress: {
            ...getShippingAddress(),
            address1: 'x',
        },
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

    it('renders widget', () => {
        component = mount(
            <Formik initialValues= { {} } onSubmit={ noop }>
                <RemoteShippingAddress { ...defaultProps } />
            </Formik>
        );

        expect(component.find('#container').hasClass('widget--amazon')).toBeTruthy();
    });

    it('calls initialize prop on mount', () => {
        component = mount(
            <Formik initialValues= { {} } onSubmit={ noop }>
                <RemoteShippingAddress { ...defaultProps } />
            </Formik>
        );

        expect(defaultProps.initialize).toHaveBeenCalled();
    });

    it('calls deinitialize prop on unmount', () => {
        component = mount(
            <Formik initialValues= { {} } onSubmit={ noop }>
                <RemoteShippingAddress { ...defaultProps } />
            </Formik>
        ).unmount();

        expect(defaultProps.deinitialize).toHaveBeenCalled();
    });

    it('renders correct number of custom form fields', () => {
        component = mount(
            <Formik
                initialValues={ initialFormikValues }
                onSubmit={ noop }
            >
                <RemoteShippingAddress { ...defaultProps } />
            </Formik>
        );

        expect(component.find(DynamicFormField).length).toEqual(3);
    });

    it('calls method to set field value on change in custom form field', () => {
        component = mount(
            <Formik
                initialValues={ initialFormikValues }
                onSubmit={ noop }
            >
                <RemoteShippingAddress { ...defaultProps } />
            </Formik>
        );

        const inputFieldName = getFormFields()[4].name;

        component.find(`input[name="shippingAddress.customFields.${inputFieldName}"]`)
            .simulate('change', { target: { value: 'foo', name: 'shippingAddress.customFields.field_25' } });

        expect(defaultProps.onFieldChange).toHaveBeenCalledWith(inputFieldName, 'foo');
    });
});
