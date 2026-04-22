import '@testing-library/jest-dom';
import { type CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React from 'react';

import {
    CheckoutProvider,
    defaultCapabilities,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import { getAddress } from './address.mock';
import AddressSelect, { type AddressSelectProps } from './AddressSelect';
import AddressType from './AddressType';
import { B2BExtraFieldsSessionStorage } from './B2BExtraFieldsSessionStorage';
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
        fireEvent.click(screen.getByTestId('add-new-address'));

        expect(onUseNewAddress).toHaveBeenCalled();

        const firstAddressOption = screen.getAllByTestId('address-select-option-action')[0];

        expect(firstAddressOption).toBeInTheDocument();

        // TODO: update with userEvent and investigate range.cloneRange() issue
        fireEvent.click(firstAddressOption);

        expect(onSelectAddress).toHaveBeenCalledWith(getCustomer().addresses[0]);
    });

    it('does not trigger onSelectAddress callback if same address is selected', () => {
        const onSelectAddress = jest.fn();
        const selectedAddress = getCustomer().addresses[0];

        renderAddressSelect({ onSelectAddress, selectedAddress });

        const addressSelectButton = screen.getByTestId('address-select-button');

        // TODO: update with userEvent and investigate range.cloneRange() issue
        fireEvent.click(addressSelectButton);

        const firstAddressOption = screen.getAllByTestId('address-select-option-action')[0];

        expect(firstAddressOption).toBeInTheDocument();

        // TODO: update with userEvent and investigate range.cloneRange() issue
        fireEvent.click(firstAddressOption);

        expect(onSelectAddress).not.toHaveBeenCalled();
    });

    it('renders searchable address dropdown when company address book is enabled', () => {
        const storeConfig = getStoreConfig();
        const configWithCompanyAddressBook = {
            ...storeConfig,
            checkoutSettings: {
                ...storeConfig.checkoutSettings,
                capabilities: {
                    ...defaultCapabilities,
                    userJourney: {
                        ...defaultCapabilities.userJourney,
                        hasCompanyAddressBook: true,
                    },
                },
            },
        };

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(configWithCompanyAddressBook);

        renderAddressSelect();

        fireEvent.click(screen.getByTestId('address-select-button'));

        expect(
            screen.getByRole('textbox', { name: 'Search addresses' }),
        ).toBeInTheDocument();
    });

    describe('storageKey / reading extra fields', () => {
        const storageKey = 'test_storage_key';

        afterEach(() => {
            B2BExtraFieldsSessionStorage.removeFields(storageKey);
        });

        it('enriches address with extra fields from session storage when storageKey is provided', () => {
            const onSelectAddress = jest.fn();

            B2BExtraFieldsSessionStorage.setFields(storageKey, { 'b2bExtraField_foo': 'bar' });

            renderAddressSelect({ onSelectAddress, storageKey });

            fireEvent.click(screen.getByTestId('address-select-button'));
            fireEvent.click(screen.getAllByTestId('address-select-option-action')[0]);

            expect(onSelectAddress).toHaveBeenCalledWith(
                expect.objectContaining({
                    extraFields: [{ fieldId: 'b2bExtraField_foo', fieldValue: 'bar' }],
                }),
            );
        });

        it('preserves numeric extra field values without string coercion', () => {
            const onSelectAddress = jest.fn();

            B2BExtraFieldsSessionStorage.setFields(storageKey, { 'b2bExtraField_num': 42 });

            renderAddressSelect({ onSelectAddress, storageKey });

            fireEvent.click(screen.getByTestId('address-select-button'));
            fireEvent.click(screen.getAllByTestId('address-select-option-action')[0]);

            expect(onSelectAddress).toHaveBeenCalledWith(
                expect.objectContaining({
                    extraFields: [{ fieldId: 'b2bExtraField_num', fieldValue: 42 }],
                }),
            );
        });

        it('does not call onSelectAddress when re-selecting an address whose extra fields match session storage', () => {
            const onSelectAddress = jest.fn();

            B2BExtraFieldsSessionStorage.setFields(storageKey, { 'b2bExtraField_foo': 'bar' });

            const selectedAddress = {
                ...getCustomer().addresses[0],
                extraFields: [{ fieldId: 'b2bExtraField_foo', fieldValue: 'bar' }],
            };

            renderAddressSelect({ onSelectAddress, selectedAddress, storageKey });

            fireEvent.click(screen.getByTestId('address-select-button'));
            fireEvent.click(screen.getAllByTestId('address-select-option-action')[0]);

            expect(onSelectAddress).not.toHaveBeenCalled();
        });

        it('calls onSelectAddress without extra fields when no storageKey is provided', () => {
            const onSelectAddress = jest.fn();

            renderAddressSelect({ onSelectAddress });

            fireEvent.click(screen.getByTestId('address-select-button'));
            fireEvent.click(screen.getAllByTestId('address-select-option-action')[0]);

            expect(onSelectAddress).toHaveBeenCalledWith(
                expect.not.objectContaining({ extraFields: expect.anything() }),
            );
        });
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
