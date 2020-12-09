import { mount, shallow } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { getFormFields } from '../address/formField.mock';
import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext } from '../locale';
import { DynamicFormField } from '../ui/form';

import RemoteShippingAddress, { RemoteShippingAddressProps } from './RemoteShippingAddress';

describe('RemoteShippingAddress Component', () => {
    const defaultProps: RemoteShippingAddressProps = {
        formFields: getFormFields(),
        containerId: 'container',
        methodId: 'amazon',
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
        const component = shallow(<RemoteShippingAddress { ...defaultProps } />);

        expect(component.find('#container').hasClass('widget--amazon')).toBeTruthy();
    });

    it('calls initialize prop on mount', () => {
        shallow(<RemoteShippingAddress { ...defaultProps } />);

        expect(defaultProps.initialize).toHaveBeenCalled();
    });

    it('calls deinitialize prop on unmount', () => {
        shallow(<RemoteShippingAddress { ...defaultProps } />).unmount();

        expect(defaultProps.initialize).toHaveBeenCalled();
    });

    it('renders correct number of custom form fields', () => {
        const component = mount(
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
        const localeContext = createLocaleContext(getStoreConfig());
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialFormikValues }
                    onSubmit={ noop }
                >
                    <RemoteShippingAddress { ...defaultProps } />
                </Formik>
            </LocaleContext.Provider>
        );

        const inputFieldName = getFormFields()[4].name;

        component.find(`input[name="shippingAddress.customFields.${inputFieldName}"]`)
            .simulate('change', { target: { value: 'foo', name: 'shippingAddress.customFields.field_25' } });

        expect(defaultProps.onFieldChange).toHaveBeenCalledWith(inputFieldName, 'foo');
    });
});
