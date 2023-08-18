import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { getAddress } from '@bigcommerce/checkout/test-utils';

import { AddressForm, AddressSelect } from '../address';
import { getAddressFormFieldsWithCustomRequired, getFormFields } from '../address/formField.mock';
import * as usePayPalConnectAddress from '../address/PayPalAxo/usePayPalConnectAddress';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { getCountries } from '../geography/countries.mock';
import { DynamicFormField } from '../ui/form';

import { getBillingAddress } from './billingAddresses.mock';
import BillingForm, { BillingFormProps } from './BillingForm';
import StaticBillingAddress from './StaticBillingAddress';

describe('BillingForm Component', () => {
    let component: ReactWrapper;
    let localeContext: LocaleContextType;
    let defaultProps: BillingFormProps;
    const checkoutService = createCheckoutService();
    const billingAddress = {
        ...getBillingAddress(),
        firstName: 'foo',
    };

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        defaultProps = {
            billingAddress,
            countriesWithAutocomplete: [],
            isUpdating: false,
            shouldShowOrderComments: false,
            customerMessage: '',
            customer: getCustomer(),
            countries: getCountries(),
            googleMapsApiKey: 'key',
            getFields: () => getFormFields(),
            onUnhandledError: jest.fn(),
            updateAddress: jest.fn(),
            onSubmit: jest.fn(),
            shouldValidateSafeInput: true,
        };

        jest.spyOn(usePayPalConnectAddress, 'default').mockImplementation(
            jest.fn().mockImplementation(() => ({
                isPayPalAxoEnabled: false,
                mergedBcAndPayPalConnectAddresses: [],
            })),
        );
    });

    beforeEach(() => {
        component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <BillingForm {...defaultProps} />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );
    });

    it('renders form with expected id', () => {
        expect(component.find('fieldset#checkoutBillingAddress')).toHaveLength(1);
    });

    it('renders form with static address and custom fields', () => {
        defaultProps = {
            ...defaultProps,
            getFields: () => getAddressFormFieldsWithCustomRequired(),
        };

        component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <BillingForm {...defaultProps} methodId="amazonpay" />
                </LocaleContext.Provider>,
            </CheckoutProvider>
        );

        expect(component.find(StaticBillingAddress)).toHaveLength(1);
        expect(component.find(AddressSelect)).toHaveLength(0);
        expect(component.find(DynamicFormField)).toHaveLength(4);
    });

    it('renders addresses', () => {
        expect(component.find('fieldset#billingAddresses')).toHaveLength(1);
        expect(component.find(AddressSelect).props()).toEqual(
            expect.objectContaining({
                addresses: getCustomer().addresses,
            }),
        );
    });

    it('does not render address form when selected customer address is valid', () => {
        component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <BillingForm
                        {...defaultProps}
                        billingAddress={defaultProps.customer.addresses[0]}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(component.find(AddressForm)).toHaveLength(0);
    });

    it('renders address form when selected customer address is not valid', () => {
        component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <BillingForm
                        {...defaultProps}
                        billingAddress={{
                            ...defaultProps.customer.addresses[0],
                            address1: '',
                        }}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(component.find(AddressForm)).toHaveLength(1);
    });

    it('renders address form', () => {
        expect(component.find(AddressForm).props()).toEqual(
            expect.objectContaining({
                countries: getCountries(),
            }),
        );
    });

    it('calls handle submit when form is submitted and valid', async () => {
        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

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
            shouldSaveAddress: true,
        });
    });

    it('calls does not call handle submit when form is submitted and invalid', async () => {
        component
            .find('input#firstNameInput')
            .simulate('change', { target: { value: '', name: 'firstName' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('renders form with PP Connect addresses', () => {
        const mergedBcAndPayPalConnectAddresses = [{
            ...getAddress(),
            address1: 'PP AXO address'
        }];

        jest.spyOn(usePayPalConnectAddress, 'default').mockImplementation(
            
            jest.fn().mockImplementation(() => ({
                isPayPalAxoEnabled: true,
                mergedBcAndPayPalConnectAddresses,
            })),
        );

        component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <BillingForm {...defaultProps} />
                </LocaleContext.Provider>,
            </CheckoutProvider>
        );

        const addressSelectComponent = component.find(AddressSelect);

        expect(addressSelectComponent).toHaveLength(1);
        expect(addressSelectComponent.props()).toEqual(
            expect.objectContaining({
                addresses: mergedBcAndPayPalConnectAddresses,
            }),
        );
    });
});
