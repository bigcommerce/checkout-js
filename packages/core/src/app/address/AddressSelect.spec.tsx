import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

import { CheckoutProvider } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';

import { getAddress } from './address.mock';
import AddressSelect from './AddressSelect';
import StaticAddress from './StaticAddress';

describe('AddressSelect Component', () => {
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
                    <AddressSelect
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
                    <AddressSelect
                        addresses={getCustomer().addresses}
                        onSelectAddress={noop}
                        onUseNewAddress={noop}
                        selectedAddress={getAddress()}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(component.find(StaticAddress).prop('address')).toEqual(getAddress());
    });

    it('renders addresses menu when select component is clicked', () => {
        component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <AddressSelect
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
        expect(options.find(StaticAddress).prop('address')).toEqual(getCustomer().addresses[0]);
    });

    it('triggers appropriate callbacks when an item is selected', () => {
        const onSelectAddress = jest.fn();
        const onUseNewAddress = jest.fn();

        component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <AddressSelect
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
                    <AddressSelect
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
