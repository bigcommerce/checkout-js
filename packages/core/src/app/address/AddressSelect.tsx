import { type Address, type CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo, type ReactNode } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { PoweredByPayPalFastlaneLabel, usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

import { DropdownTrigger } from '../ui/dropdown';

import AddressSelectButton from './AddressSelectButton';
import type AddressType from './AddressType';
import isEqualAddress from './isEqualAddress';
import StaticAddress from './StaticAddress';

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

const AddressSelectMenu: FunctionComponent<AddressSelectProps> = ({
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

const AddressSelect = ({
    addresses,
    selectedAddress,
    type,
    showSingleLineAddress,
    onSelectAddress,
    onUseNewAddress,
    placeholderText,
}: AddressSelectProps) => {
    const { shouldShowPayPalFastlaneLabel } = usePayPalFastlaneAddress();

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
                        <AddressSelectMenu
                            addresses={addresses}
                            onSelectAddress={handleSelectAddress}
                            onUseNewAddress={handleUseNewAddress}
                            selectedAddress={selectedAddress}
                            type={type}
                        />
                    }
                >
                    <AddressSelectButton
                        addresses={addresses}
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
}

export default memo(AddressSelect);
