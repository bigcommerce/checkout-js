import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { AddressForm, AddressSelect } from '../address';
import { getFormFields } from '../address/formField.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';

import { getConsignment } from './consignment.mock';
import { getShippingAddress } from './shipping-addresses.mock';
import ShippingAddressForm, { ShippingAddressFormProps } from './ShippingAddressForm';

describe('ShippingAddressForm Component', () => {
    let component: ReactWrapper;
    let defaultProps: ShippingAddressFormProps;

    beforeEach(() => {
        defaultProps = {
            consignments: [getConsignment()],
            countriesWithAutocomplete: [],
            addresses: getCustomer().addresses,
            address: getCustomer().addresses[0],
            formFields: getFormFields(),
            onAddressSelect: jest.fn(),
            onFieldChange: jest.fn(),
            onUseNewAddress: jest.fn(),
            isLoading: false,
        };
    });

    describe('when there are addresses (signed-in user)', () => {
        beforeEach(() => {
            component = mount(
                <Formik initialValues={{}} onSubmit={noop}>
                    <ShippingAddressForm {...defaultProps} />
                </Formik>,
            );
        });

        it('doest not render address form', () => {
            expect(component.find(AddressForm)).toHaveLength(0);
        });

        it('renders address select', () => {
            expect(component.find(AddressSelect).props()).toMatchObject({
                addresses: defaultProps.addresses,
                selectedAddress: defaultProps.address,
            });
        });

        it('renders address form when selected address is not in the address list', () => {
            component = mount(
                <Formik initialValues={{}} onSubmit={noop}>
                    <ShippingAddressForm
                        {...defaultProps}
                        address={{
                            ...getShippingAddress(),
                            firstName: 'foo',
                        }}
                    />
                </Formik>,
            );

            expect(component.find(AddressForm).props()).toMatchObject({
                formFields: defaultProps.formFields,
            });
        });

        it('renders address form when selected address is not valid even when in the list', () => {
            component = mount(
                <Formik initialValues={{}} onSubmit={noop}>
                    <ShippingAddressForm
                        {...defaultProps}
                        formFields={[
                            ...defaultProps.formFields,
                            {
                                ...defaultProps.formFields[1],
                                name: 'newRequiredField',
                                required: true,
                            },
                        ]}
                    />
                </Formik>,
            );

            expect(component.find(AddressSelect).prop('selectedAddress')).toBeFalsy();

            expect(component.find(AddressForm)).toHaveLength(1);
        });

        it('renders address form when there is no selected address', () => {
            component = mount(
                <Formik initialValues={{}} onSubmit={noop}>
                    <ShippingAddressForm {...defaultProps} address={undefined} />
                </Formik>,
            );

            expect(component.find(AddressForm).props()).toMatchObject({
                formFields: defaultProps.formFields,
            });
        });
    });

    describe('when there are no addresses (guest user)', () => {
        beforeEach(() => {
            component = mount(
                <Formik initialValues={{}} onSubmit={noop}>
                    <ShippingAddressForm {...defaultProps} addresses={[]} />
                </Formik>,
            );
        });

        it('renders address form', () => {
            expect(component.find(AddressForm).props()).toMatchObject({
                formFields: defaultProps.formFields,
            });
        });
    });

    describe('when address is updated', () => {
        let checkoutService: CheckoutService;
        let localeContext: LocaleContextType;

        beforeEach(() => {
            checkoutService = createCheckoutService();
            localeContext = createLocaleContext(getStoreConfig());

            jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(
                getCheckout(),
            );
            jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(
                getStoreConfig(),
            );

            component = mount(
                <LocaleContext.Provider value={localeContext}>
                    <Formik
                        initialValues={{
                            shippingAddress: getShippingAddress(),
                        }}
                        onSubmit={noop}
                    >
                        <ShippingAddressForm
                            {...defaultProps}
                            address={getShippingAddress()}
                            addresses={[]}
                        />
                    </Formik>
                </LocaleContext.Provider>,
            );
        });
    });
});
