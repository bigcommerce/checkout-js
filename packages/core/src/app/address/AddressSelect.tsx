import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { memo, type ReactNode, useMemo } from 'react';

import { useCapabilities } from '@bigcommerce/checkout/contexts';
import {
    PoweredByPayPalFastlaneLabel,
    usePayPalFastlaneAddress,
} from '@bigcommerce/checkout/paypal-fastlane-integration';
import { DropdownTrigger } from '@bigcommerce/checkout/ui';

import AddressSelectButton from './AddressSelectButton';
import { AddressSelectComponent } from './AddressSelectComponent';
import type AddressType from './AddressType';
import isEqualAddress from './isEqualAddress';
import { SearchableAddressSelectComponent } from './SearchableAddressSelectComponent';
import { COMPANY_ADDRESS_SEARCH_LIMIT, matchesAddressType } from './useCompanyAddressSearch';

import './AddressSelect.scss';

export interface AddressSelectProps {
    addresses: CustomerAddress[];
    selectedAddress?: Address;
    type: AddressType;
    showSingleLineAddress?: boolean;
    onSelectAddress(address: Address): void;
    onUseNewAddress(currentAddress?: Address): void;
    placeholderText?: ReactNode;
}

const AddressSelect = ({
    addresses,
    selectedAddress,
    type,
    showSingleLineAddress,
    onSelectAddress,
    onUseNewAddress,
    placeholderText,
}: AddressSelectProps) => {
    const {
        userJourney: { hasCompanyAddressBook },
    } = useCapabilities();
    const { shouldShowPayPalFastlaneLabel } = usePayPalFastlaneAddress();

    const dropdownAddresses = useMemo(
        () =>
            hasCompanyAddressBook
                ? addresses.filter((address) => matchesAddressType(address, type))
                : addresses,
        [addresses, hasCompanyAddressBook, type],
    );

    const shouldShowSearch =
        hasCompanyAddressBook && dropdownAddresses.length >= COMPANY_ADDRESS_SEARCH_LIMIT;

    const handleSelectAddress = (newAddress: Address) => {
        if (!isEqualAddress(selectedAddress, newAddress)) {
            onSelectAddress(newAddress);
        }
    };

    const handleUseNewAddress = () => {
        onUseNewAddress(selectedAddress);
    };

    return (
        <div className="form-field">
            <div className="dropdown--select">
                <DropdownTrigger
                    dropdown={
                        shouldShowSearch ? (
                            <SearchableAddressSelectComponent
                                addresses={addresses}
                                onSelectAddress={handleSelectAddress}
                                onUseNewAddress={handleUseNewAddress}
                                selectedAddress={selectedAddress}
                                type={type}
                            />
                        ) : (
                            <AddressSelectComponent
                                addresses={dropdownAddresses}
                                onSelectAddress={handleSelectAddress}
                                onUseNewAddress={handleUseNewAddress}
                                selectedAddress={selectedAddress}
                                type={type}
                            />
                        )
                    }
                >
                    <AddressSelectButton
                        placeholderText={placeholderText}
                        selectedAddress={selectedAddress}
                        showSingleLineAddress={showSingleLineAddress}
                        type={type}
                    />
                </DropdownTrigger>
            </div>

            {shouldShowPayPalFastlaneLabel && <PoweredByPayPalFastlaneLabel />}
        </div>
    );
};

export default memo(AddressSelect);
