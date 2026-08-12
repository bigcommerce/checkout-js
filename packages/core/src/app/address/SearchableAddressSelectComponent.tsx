import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { type ChangeEvent, type FunctionComponent, useState } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';

import { AddNewAddressItem } from './AddNewAddressItem';
import { AddressSelectSearchItem } from './AddressSelectSearchItem';
import type AddressType from './AddressType';
import StaticAddress from './StaticAddress';
import { useCompanyAddressSearch } from './useCompanyAddressSearch';
import { useRestrictManualAddressEntry } from './useRestrictManualAddressEntry';

export interface SearchableAddressSelectProps {
    addresses: CustomerAddress[];
    selectedAddress?: Address;
    type: AddressType;
    onSelectAddress(address: Address): void;
    onUseNewAddress(currentAddress?: Address): void;
}

export const SearchableAddressSelectComponent: FunctionComponent<SearchableAddressSelectProps> = ({
    addresses,
    onSelectAddress,
    onUseNewAddress,
    selectedAddress,
    type,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const restrictManualAddressEntry = useRestrictManualAddressEntry(type);

    const { filteredAddresses } = useCompanyAddressSearch({
        addresses,
        searchQuery,
        type,
    });

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <ul
            className="dropdown-menu instrumentSelect-dropdownMenu searchable-menu"
            id="addressDropdown"
        >
            {!restrictManualAddressEntry && (
                <AddNewAddressItem
                    onUseNewAddress={onUseNewAddress}
                    selectedAddress={selectedAddress}
                />
            )}
            <AddressSelectSearchItem
                onSearchChange={handleSearchChange}
                searchQuery={searchQuery}
            />
            {filteredAddresses.map((address) => (
                <li
                    className="dropdown-menu-item dropdown-menu-item--select"
                    data-test="address-select-option"
                    key={address.id}
                >
                    <a
                        data-test="address-select-option-action"
                        href="#"
                        onClick={preventDefault(() => onSelectAddress(address))}
                    >
                        <StaticAddress address={address} type={type} />
                    </a>
                </li>
            ))}
        </ul>
    );
};
