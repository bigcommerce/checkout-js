import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { PoweredByPayPalFastlaneLabel, usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

import { DropdownTrigger } from '../ui/dropdown';

import AddressSelectButton from './AddressSelectButton';
import isEqualAddress from './isEqualAddress';
import StaticAddress from './StaticAddress';

import './AddressSelect.scss';
import AddressType from './AddressType';

export interface AddressSelectProps {
    addresses: CustomerAddress[];
    selectedAddress?: Address;
    type: AddressType;
    onSelectAddress(address: Address): void;
    onUseNewAddress(currentAddress?: Address): void;
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
            <li className="dropdown-menu-item dropdown-menu-item--select" key={address.id}>
                <a href="#" onClick={preventDefault(() => onSelectAddress(address))}>
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
    onSelectAddress,
    onUseNewAddress,
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
                        selectedAddress={selectedAddress}
                        type={type}
                    />
                </DropdownTrigger>
            </div>

            {shouldShowPayPalFastlaneLabel && <PoweredByPayPalFastlaneLabel />}
        </div>
    );
}

export default memo(AddressSelect);
