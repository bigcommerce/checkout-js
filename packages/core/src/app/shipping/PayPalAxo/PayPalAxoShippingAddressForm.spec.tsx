import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { getCheckout, getConsignment, getCustomer, getShippingAddress, getStoreConfig } from '@bigcommerce/checkout/test-utils';

import { AddressForm } from '../../address';
import { getFormFields } from '../../address/formField.mock';
import { PayPalAxoAddressSelect } from '../../address/PayPalAxo';

import PayPalAxoShippingAddressForm, { PayPalAxoShippingAddressFormProps } from './PayPalAxoShippingAddressForm';

describe('PayPalAxoShippingAddressForm Component', () => {
    let component: ReactWrapper;
    let defaultProps: PayPalAxoShippingAddressFormProps;

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

    const mountComponent = (props = {}) => {
        const checkoutService = createCheckoutService();

        return mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <PayPalAxoShippingAddressForm
                        {...defaultProps}
                        {...props}
                    />
                </Formik>,
            </CheckoutProvider>
        );
    };

    describe('when there are addresses (signed-in user)', () => {
        beforeEach(() => {
            component = mountComponent();
        });

        it('doest not render address form', () => {
            expect(component.find(AddressForm)).toHaveLength(0);
        });

        it('renders address select', () => {
            expect(component.find(PayPalAxoAddressSelect).props()).toMatchObject({
                addresses: defaultProps.addresses,
                selectedAddress: defaultProps.address,
            });
        });

        it('renders address form when selected address is not in the address list', () => {
            component = mountComponent({
                address: {
                    ...getShippingAddress(),
                    firstName: 'foo',
                }
            });

            expect(component.find(AddressForm).props()).toMatchObject({
                formFields: defaultProps.formFields,
            });
        });

        it('renders address form when selected address is not valid even when in the list', () => {
            component = mountComponent({
                formFields: [
                    ...defaultProps.formFields,
                    {
                        ...defaultProps.formFields[1],
                        name: 'newRequiredField',
                        required: true,
                    },
                ]
            });

            expect(component.find(PayPalAxoAddressSelect).prop('selectedAddress')).toBeFalsy();

            expect(component.find(AddressForm)).toHaveLength(1);
        });

        it('renders address form when there is no selected address', () => {
            component = mountComponent({
                address: undefined,
            });

            expect(component.find(AddressForm).props()).toMatchObject({
                formFields: defaultProps.formFields,
            });
        });
    });

    describe('when there are no addresses (guest user)', () => {
        beforeEach(() => {
            component = mountComponent({
                address: [],
            });
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
                        <PayPalAxoShippingAddressForm
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
