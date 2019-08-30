import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { getAddressFormFields } from '../address/formField.mock';
import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';

import { getShippingAddress } from './shipping-addresses.mock';
import SingleShippingForm, { SingleShippingFormProps, SHIPPING_AUTOSAVE_DELAY } from './SingleShippingForm';

/* eslint-disable react/jsx-no-bind */
describe('SingleShippingForm', () => {
    const addressFormFields = getAddressFormFields().filter(({ custom }) => !custom );
    let localeContext: LocaleContextType;
    let component: ReactWrapper;
    let defaultProps: SingleShippingFormProps;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        defaultProps = {
            isMultiShippingMode: false,
            countries: [],
            countriesWithAutocomplete: [],
            shippingAddress: getShippingAddress(),
            customerMessage: '',
            addresses: [],
            shouldShowOrderComments: true,
            consignments: [],
            cartHasChanged: false,
            isLoading: false,
            onSubmit: jest.fn(),
            getFields: jest.fn(() => addressFormFields),
            onUnhandledError: jest.fn(),
            deinitialize: jest.fn(),
            signOut: jest.fn(),
            initialize: jest.fn(),
            updateAddress: jest.fn(),
            deleteConsignments: jest.fn(),
        };

        component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <SingleShippingForm { ...defaultProps } />
            </LocaleContext.Provider>
        );
    });

    it('calls updateAddress with last event during a given timeframe', done => {
        component.find('input[name="shippingAddress.address1"]')
            .simulate('change', { target: { value: 'foo 1', name: 'shippingAddress.address1' } });

        component.find('input[name="shippingAddress.address1"]')
            .simulate('change', { target: { value: 'foo 2', name: 'shippingAddress.address1' } });

        setTimeout(() => {
            expect(defaultProps.updateAddress).toHaveBeenCalledTimes(1);
            expect(defaultProps.updateAddress).toHaveBeenCalledWith({
                ...getShippingAddress(),
                address1: 'foo 2',
            });
            done();
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });

    it('calls updateAddress if modified field does not affect shipping but makes form valid', done => {
        component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <SingleShippingForm
                    { ...defaultProps }
                    getFields={ () => [
                        ...addressFormFields.map(field => ({ ...field, required: true })),
                    ] }
                />
            </LocaleContext.Provider>
        );

        component.find('input[name="shippingAddress.address2"]')
            .simulate('change', { target: { value: '', name: 'shippingAddress.address2' } });

        component.find('input[name="shippingAddress.address2"]')
            .simulate('change', { target: { value: 'foo 1', name: 'shippingAddress.address2' } });

        setTimeout(() => {
            expect(defaultProps.updateAddress).toHaveBeenCalledTimes(1);
            done();
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });

    it('does not call updateAddress if modified field does not affect shipping', done => {
        component.find('input[name="shippingAddress.address2"]')
            .simulate('change', { target: { value: 'foo 1', name: 'shippingAddress.address2' } });

        setTimeout(() => {
            expect(defaultProps.updateAddress).not.toHaveBeenCalled();
            done();
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });

    it('does not call updateAddress if modified field produces invalid address', done => {
        component.find('input[name="shippingAddress.address1"]')
            .simulate('change', { target: { value: '', name: 'shippingAddress.address1' } });

        setTimeout(() => {
            expect(defaultProps.updateAddress).not.toHaveBeenCalled();
            done();
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });

    it('does not call updateAddress if not valid address', done => {
        component.find('input[name="shippingAddress.address1"]')
            .simulate('change', { target: { value: '', name: 'shippingAddress.address1' } });

        setTimeout(() => {
            expect(defaultProps.updateAddress).not.toHaveBeenCalled();
            done();
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });

    it('does not call updateAddress if same address', done => {
        component.find('input[name="shippingAddress.address1"]')
            .simulate('change', { target: { value: '', name: getShippingAddress().address1 } });

        setTimeout(() => {
            expect(defaultProps.updateAddress).not.toHaveBeenCalled();
            done();
        }, SHIPPING_AUTOSAVE_DELAY * 1.1);
    });
});
