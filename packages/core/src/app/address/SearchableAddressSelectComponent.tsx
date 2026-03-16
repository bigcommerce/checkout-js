import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { type ChangeEvent, type FunctionComponent, useMemo, useState } from 'react';

import { useCapabilities, useLocale } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { TextInput } from '@bigcommerce/checkout/ui';

import AddressType from './AddressType';
import { searchingAddresses } from './searchingAddresses';
import StaticAddress from './StaticAddress';

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

    const { language } = useLocale();
    const { 
        shipping: { restrictManualAddressEntry : restrictManualAddressEntryForShipping }, 
        billing: { restrictManualAddressEntry : restrictManualAddressEntryForBilling } 
    } = useCapabilities();
    const restrictManualAddressEntry = type === AddressType.Shipping ? restrictManualAddressEntryForShipping : restrictManualAddressEntryForBilling;

    const filteredAddresses = useMemo(
        () => searchingAddresses(addresses, searchQuery),
        [addresses, searchQuery],
    );

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <ul className="dropdown-menu instrumentSelect-dropdownMenu searchable-menu" id="addressDropdown">
            {!restrictManualAddressEntry &&
                <li className="dropdown-menu-item dropdown-menu-item--select">
                    <a
                        data-test="add-new-address"
                        href="#"
                        onClick={preventDefault(() => onUseNewAddress(selectedAddress))}
                    >
                        <TranslatedString id="address.enter_address_action" />
                    </a>
                </li>
            }
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <li
                className="dropdown-menu-item"
                data-test="address-select-search"
                onClick={(e) => e.stopPropagation()}
            >
                <TextInput
                    aria-label={language.translate('address.search_addresses')}
                    data-test="address-select-search-input"
                    name="searchAddresses"
                    onChange={handleSearchChange}
                    placeholder={language.translate('address.search_addresses')}
                    type="text"
                    value={searchQuery}
                />
            </li>
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
