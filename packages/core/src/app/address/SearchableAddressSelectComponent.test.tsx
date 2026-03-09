import '@testing-library/jest-dom';
import { type CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React from 'react';

import { CheckoutProvider, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { getCountries } from '../geography/countries.mock';

import { getAddress } from './address.mock';
import AddressType from './AddressType';
import {
    SearchableAddressSelectComponent,
    type SearchableAddressSelectProps,
} from './SearchableAddressSelectComponent';

describe('SearchableAddressSelectComponent', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;

    const defaultProps: SearchableAddressSelectProps = {
        addresses: getCustomer().addresses,
        onSelectAddress: noop,
        onUseNewAddress: noop,
        type: AddressType.Billing,
    };

    const renderComponent = (props?: Partial<SearchableAddressSelectProps>) => {
        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <SearchableAddressSelectComponent {...defaultProps} {...props} />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutService.getState().data, 'getBillingCountries').mockReturnValue(getCountries());
        jest.spyOn(checkoutService.getState().data, 'getShippingCountries').mockReturnValue(getCountries());
    });

    it('renders "Enter a new address" link when addresses exist', () => {
        renderComponent();

        expect(screen.getByTestId('add-new-address')).toBeInTheDocument();
        expect(screen.getByText('Enter a new address')).toBeInTheDocument();
    });

    it('renders search input with placeholder and aria-label', () => {
        renderComponent();

        const searchInput = screen.getByRole('textbox', { name: 'Search addresses' });

        expect(searchInput).toBeInTheDocument();
        expect(searchInput).toHaveAttribute('aria-label', 'Search addresses');
        expect(searchInput).toHaveAttribute('placeholder', 'Search addresses');
    });

    it('calls onUseNewAddress with selectedAddress when "Enter a new address" is clicked', () => {
        const onUseNewAddress = jest.fn();
        const selectedAddress = getAddress();

        renderComponent({ onUseNewAddress, selectedAddress });

        fireEvent.click(screen.getByTestId('add-new-address'));

        expect(onUseNewAddress).toHaveBeenCalledWith(selectedAddress);
    });

    it('calls onUseNewAddress with undefined when no address is selected and "Enter a new address" is clicked', () => {
        const onUseNewAddress = jest.fn();

        renderComponent({ onUseNewAddress, selectedAddress: undefined });

        fireEvent.click(screen.getByTestId('add-new-address'));

        expect(onUseNewAddress).toHaveBeenCalledWith(undefined);
    });

    it('calls onSelectAddress with selected address when an address option is clicked', () => {
        const onSelectAddress = jest.fn();
        const addresses = getCustomer().addresses;

        renderComponent({ onSelectAddress, addresses });

        const firstOptionAction = screen.getAllByTestId('address-select-option-action')[0];

        fireEvent.click(firstOptionAction);

        expect(onSelectAddress).toHaveBeenCalledWith(addresses[0]);
    });

    it('filters addresses when user types in search input', () => {
        const addresses = getCustomer().addresses;

        renderComponent({ addresses });

        const searchInput = screen.getByRole('textbox', { name: 'Search addresses' });
        const initialOptionCount = screen.getAllByTestId('address-select-option').length;

        fireEvent.change(searchInput, { target: { value: 'Invalid' } });

        const filteredOptionCount = screen.getAllByTestId('address-select-option').length;

        expect(filteredOptionCount).toBeLessThan(initialOptionCount);
        expect(screen.getByText('Invalid Address')).toBeInTheDocument();
    });

    it('renders all addresses when search query is empty', () => {
        const addresses = getCustomer().addresses;

        renderComponent({ addresses });

        expect(screen.getAllByTestId('address-select-option')).toHaveLength(addresses.length);
    });
});
