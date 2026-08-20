import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';

import { AddNewAddressItem } from './AddNewAddressItem';
import type AddressType from './AddressType';
import StaticAddress from './StaticAddress';
import { useRestrictManualAddressEntry } from './useRestrictManualAddressEntry';

export interface AddressSelectComponentProps {
    addresses: CustomerAddress[];
    selectedAddress?: Address;
    type: AddressType;
    onSelectAddress(address: Address): void;
    onUseNewAddress(currentAddress?: Address): void;
}

export const AddressSelectComponent: FunctionComponent<AddressSelectComponentProps> = ({
    addresses,
    onSelectAddress,
    onUseNewAddress,
    selectedAddress,
    type,
}) => {
    const restrictManualAddressEntry = useRestrictManualAddressEntry(type);

    return (
        <ul className="dropdown-menu instrumentSelect-dropdownMenu" id="addressDropdown">
            {!restrictManualAddressEntry && (
                <AddNewAddressItem
                    onUseNewAddress={onUseNewAddress}
                    selectedAddress={selectedAddress}
                />
            )}
            {addresses.map((address) => (
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
