import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { getAddress, getCheckout, getCustomer, getStoreConfig } from '@bigcommerce/checkout/test-utils';

import PayPalAxoAddressSelect from './PayPalAxoAddressSelect';
import PayPalAxoStaticAddress from './PayPalAxoStaticAddress';

describe('PayPalAxoAddressSelect Component', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;
    let component: ReactWrapper;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());
    });

    it('renders `Enter Address` when there is no selected address', () => {
        component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <PayPalAxoAddressSelect
                        addresses={getCustomer().addresses}
                        onSelectAddress={noop}
                        onUseNewAddress={noop}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(component.find('#addressToggle').text()).toBe('Enter a new address');
    });

    it('renders static address when there is a selected address', () => {
        component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <PayPalAxoAddressSelect
                        addresses={getCustomer().addresses}
                        onSelectAddress={noop}
                        onUseNewAddress={noop}
                        selectedAddress={getAddress()}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(component.find(PayPalAxoStaticAddress).prop('address')).toEqual(getAddress());
    });

    it('renders addresses menu when select component is clicked', () => {
        component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <PayPalAxoAddressSelect
                        addresses={getCustomer().addresses}
                        onSelectAddress={noop}
                        onUseNewAddress={noop}
                        selectedAddress={getAddress()}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        component.find('#addressToggle').simulate('click');

        const options = component.find('#addressDropdown li');

        expect(options.first().text()).toBe('Enter a new address');
        expect(options.find(PayPalAxoStaticAddress).prop('address')).toEqual(getCustomer().addresses[0]);
    });

    it('triggers appropriate callbacks when an item is selected', () => {
        const onSelectAddress = jest.fn();
        const onUseNewAddress = jest.fn();

        component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <PayPalAxoAddressSelect
                        addresses={getCustomer().addresses}
                        onSelectAddress={onSelectAddress}
                        onUseNewAddress={onUseNewAddress}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        component.find('#addressToggle').simulate('click');
        component.find('#addressDropdown li:first-child a').simulate('click');

        expect(onUseNewAddress).toHaveBeenCalled();

        component.find('#addressDropdown li:last-child a').simulate('click');

        expect(onSelectAddress).toHaveBeenCalledWith(getCustomer().addresses[0]);
    });

    it('doest not trigger onSelectAddress callback if same address is selected', () => {
        const onSelectAddress = jest.fn();

        component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <PayPalAxoAddressSelect
                        addresses={getCustomer().addresses}
                        onSelectAddress={onSelectAddress}
                        onUseNewAddress={noop}
                        selectedAddress={getAddress()}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        component.find('#addressToggle').simulate('click');
        component.find('#addressDropdown li:last-child a').simulate('click');

        expect(onSelectAddress).not.toHaveBeenCalled();
    });
});
