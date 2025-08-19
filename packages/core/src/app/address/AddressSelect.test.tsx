import '@testing-library/jest-dom';
import { type CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import { getAddress } from './address.mock';
import AddressSelect, { type AddressSelectProps } from './AddressSelect';
import AddressType from './AddressType';
import { getAddressContent } from './SingleLineStaticAddress';

describe('AddressSelect component', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;

    const renderAddressSelect = (props?: Partial<AddressSelectProps>) => {
        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <AddressSelect
                        addresses={getCustomer().addresses}
                        onSelectAddress={noop}
                        onUseNewAddress={noop}
                        type={AddressType.Billing}
                        {...props}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());
    });

    it('renders `Enter Address` when there is no selected address', () => {
        renderAddressSelect();

        expect(screen.getByText('Enter a new address')).toBeInTheDocument();
    });

    it('renders static address when there is a selected address', () => {
        const selectedAddress = getAddress();

        renderAddressSelect({ selectedAddress });

        expect(screen.getByTestId('static-address')).toBeInTheDocument();
        expect(screen.getByText(selectedAddress.firstName)).toBeInTheDocument();
        expect(screen.getByText(selectedAddress.lastName)).toBeInTheDocument();
    });

    it('renders single line static address when there is a selected address and showSingleLineAddress is true', () => {
        const selectedAddress = getAddress();

        renderAddressSelect({ selectedAddress, showSingleLineAddress: true });

        expect(screen.getByTestId('static-address')).toBeInTheDocument();
        expect(screen.getByText(getAddressContent(selectedAddress))).toBeInTheDocument();
    });

    it('renders addresses menu when select component is clicked', () => {
        const selectedAddress = getAddress();

        renderAddressSelect({ selectedAddress });

        // TODO: update with userEvent and investigate range.cloneRange() issue
        fireEvent.click(screen.getByTestId('address-select-button'));

        // INFO: there 4 'static-address' component should be in the document
        // 1st one is located in Address select button (head of dropdown)
        // The remaining 3 are part of the dropdown options for addresses
        expect(screen.getAllByTestId('static-address')).toHaveLength(4);
        expect(screen.getByText('Enter a new address')).toBeInTheDocument();
    });

    it('triggers appropriate callbacks when an item is selected', () => {
        const onSelectAddress = jest.fn();
        const onUseNewAddress = jest.fn();

        renderAddressSelect({ onSelectAddress, onUseNewAddress });

        // TODO: update with userEvent and investigate range.cloneRange() issue
        fireEvent.click(screen.getByTestId('address-select-button'));
        // TODO: update with userEvent and investigate range.cloneRange() issue
        fireEvent.click(screen.getByTestId('add-new-address'))

        expect(onUseNewAddress).toHaveBeenCalled();

        // eslint-disable-next-line testing-library/no-node-access
        const addressOption = screen.getAllByTestId('address-select-option')[0].firstChild;

        expect(addressOption).toBeInTheDocument();

        if (addressOption) {
            // TODO: update with userEvent and investigate range.cloneRange() issue
            fireEvent.click(addressOption);
        }

        expect(onSelectAddress).toHaveBeenCalledWith(getCustomer().addresses[0]);
    });

    it('doest not trigger onSelectAddress callback if same address is selected', () => {
        const onSelectAddress = jest.fn();
        const selectedAddress = getCustomer().addresses[0];

        renderAddressSelect({ onSelectAddress, selectedAddress });

        const addressSelectButton = screen.getByTestId('address-select-button');

        // TODO: update with userEvent and investigate range.cloneRange() issue
        fireEvent.click(addressSelectButton);

        // eslint-disable-next-line testing-library/no-node-access
        const addressOption = screen.getAllByTestId('address-select-option')[0].firstChild;

        expect(addressOption).toBeInTheDocument();

        if (addressOption) {
            // TODO: update with userEvent and investigate range.cloneRange() issue
            fireEvent.click(addressOption);
        }

        expect(onSelectAddress).not.toHaveBeenCalled();
    });

    it('shows Powered By PP Fastlane label', () => {
        const defaultStoreConfig = getStoreConfig();

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
            ...defaultStoreConfig,
            checkoutSettings: {
                ...defaultStoreConfig.checkoutSettings,
                providerWithCustomCheckout: 'paypalcommerceacceleratedcheckout',
            },
        });

        jest.spyOn(checkoutService.getState().data, 'getPaymentProviderCustomer').mockReturnValue({
            authenticationState: 'succeeded',
            addresses: [getAddress()],
            instruments: [],
        });

        renderAddressSelect();

        expect(screen.getByTestId('paypal-fastlane-icon')).toBeInTheDocument();
    });
});
