import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import type AddressType from './AddressType';
import StaticAddress from './StaticAddress';

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
}) => (
    <ul className="dropdown-menu instrumentSelect-dropdownMenu" id="addressDropdown">
        <li className="dropdown-menu-item dropdown-menu-item--select">
            <a
                data-test="add-new-address"
                href="#"
                onClick={preventDefault(() => onUseNewAddress(selectedAddress))}
            >
                <TranslatedString id="address.enter_address_action" />
            </a>
        </li>
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
