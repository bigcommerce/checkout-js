import { mount, shallow } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { getFormFields } from '../address/formField.mock';
import { getCustomer } from '../customer/customers.mock';

import { getConsignment } from './consignment.mock';
import { getShippingAddress } from './shipping-addresses.mock';
import RemoteShippingAddress from './RemoteShippingAddress';
import ShippingAddress, { ShippingAddressProps } from './ShippingAddress';
import ShippingAddressForm from './ShippingAddressForm';

describe('ShippingAddress Component', () => {
    const defaultProps: ShippingAddressProps = {
        consignments: [ getConsignment() ],
        addresses: getCustomer().addresses,
        shippingAddress: {
            ...getShippingAddress(),
            address1: 'x',
        },
        countriesWithAutocomplete: [],
        isLoading: false,
        hasRequestedShippingOptions: false,
        formFields: getFormFields(),
        onAddressSelect: jest.fn(),
        onFieldChange: jest.fn(),
        initialize: jest.fn(),
        deinitialize: jest.fn(),
        onUnhandledError: jest.fn(),
        onUseNewAddress: jest.fn(),
    };

    describe('when no method id is provided', () => {
        it('renders ShippingAddressForm with expected props', () => {
            const component = shallow(<ShippingAddress { ...defaultProps } />);

            expect(component.find(ShippingAddressForm).props()).toEqual(
                expect.objectContaining({
                    formFields: defaultProps.formFields,
                    addresses: defaultProps.addresses,
                    onUseNewAddress: defaultProps.onUseNewAddress,
                    address: defaultProps.shippingAddress,
                })
            );
        });

        it('calls onAddressSelect when an address is selected', async () => {
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <ShippingAddress { ...defaultProps } />
                </Formik>
            );

            component.find('#addressToggle').simulate('click');
            component.find('#addressDropdown li').at(1).find('a').simulate('click');

            await new Promise(resolve => process.nextTick(resolve));

            expect(defaultProps.onAddressSelect).toHaveBeenCalled();
        });

        it('does not render RemoteShippingAddress', () => {
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <ShippingAddress { ...defaultProps } />
                </Formik>
            );

            expect(component.find(RemoteShippingAddress).length).toEqual(0);
        });
    });

    describe('when method id is provided', () => {
        it('renders RemoteShippingAddress with expected props', () => {
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <ShippingAddress { ...defaultProps } methodId="amazon" />
                </Formik>
            );

            expect(component.find(RemoteShippingAddress).props()).toEqual(
                expect.objectContaining({
                    containerId: 'addressWidget',
                    methodId: 'amazon',
                    deinitialize: defaultProps.deinitialize,
                    formFields: defaultProps.formFields,
                })
            );

            expect(defaultProps.initialize).toHaveBeenCalledWith({
                methodId: 'amazon',
                amazon: {
                    container: 'addressWidget',
                    onError: defaultProps.onUnhandledError,
                },
            });
        });

        it('does not render ShippingAddressForm', () => {
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <ShippingAddress { ...defaultProps } methodId="amazon" />
                </Formik>
            );

            expect(component.find(ShippingAddressForm).length).toEqual(0);
        });
    });
});
