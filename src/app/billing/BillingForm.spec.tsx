import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { AddressForm, AddressSelect } from '../address';
import { getFormFields } from '../address/formField.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { getCountries } from '../geography/countries.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';

import { getBillingAddress } from './billingAddresses.mock';
import BillingForm, { BillingFormProps } from './BillingForm';

describe('BillingForm Component', () => {
    let component: ReactWrapper;
    let localeContext: LocaleContextType;
    let defaultProps: BillingFormProps;
    const billingAddress = {
        ...getBillingAddress(),
        firstName: 'foo',
    };

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        defaultProps = {
            billingAddress,
            countriesWithAutocomplete: [],
            shouldShowOrderComments: false,
            customerMessage: '',
            customer: getCustomer(),
            countries: getCountries(),
            googleMapsApiKey: 'key',
            getFields: () => getFormFields(),
            onUnhandledError: jest.fn(),
            updateAddress: jest.fn(),
            onSubmit: jest.fn(),
        };
    });

    beforeEach(() => {
        component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <BillingForm { ...defaultProps } />
            </LocaleContext.Provider>
        );
    });

    it('renders form with expected id', () => {
        expect(component.find('fieldset#checkoutBillingAddress').length).toEqual(1);
    });

    it('renders addresses', () => {
        expect(component.find('fieldset#billingAddresses').length).toEqual(1);
        expect(component.find(AddressSelect).props()).toEqual(expect.objectContaining({
            addresses: getCustomer().addresses,
        }));
    });

    it('does not render address form when selected customer address is valid', () => {
        component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <BillingForm { ...defaultProps }
                    billingAddress={ defaultProps.customer.addresses[0] }
                />
            </LocaleContext.Provider>
        );

        expect(component.find(AddressForm).length).toEqual(0);
    });

    it('renders address form when selected customer address is not valid', () => {
        component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <BillingForm { ...defaultProps }
                    billingAddress={ {
                        ...defaultProps.customer.addresses[0],
                        address1: '',
                    } }
                />
            </LocaleContext.Provider>
        );

        expect(component.find(AddressForm).length).toEqual(1);
    });

    it('renders address form', () => {
        expect(component.find(AddressForm).props()).toEqual(expect.objectContaining({
            countries: getCountries(),
        }));
    });

    it('calls handle submit when form is submitted and valid', async () => {
        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(defaultProps.onSubmit).toHaveBeenCalledWith({
            address1: '12345 Testing Way',
            address2: '',
            customFields: {
                field_25: '',
                field_27: '',
                field_31: '',
            },
            orderComment: '',
            stateOrProvince: '',
            stateOrProvinceCode: '',
            firstName: 'foo',
            lastName: 'Tester',
        });
    });

    it('calls does not call handle submit when form is submitted and invalid', async () => {
        component.find('input#firstNameInput')
            .simulate('change', { target: { value: '', name: 'firstName' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
});
