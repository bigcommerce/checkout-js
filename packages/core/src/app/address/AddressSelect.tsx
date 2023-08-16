import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { preventDefault } from '../common/dom';
import { DropdownTrigger } from '../ui/dropdown';

import AddressSelectButton from './AddressSelectButton';
import isEqualAddress from './isEqualAddress';
import { PoweredByPaypalConnectLabel, usePayPalConnectAddress } from './PayPalAxo';
import StaticAddress from './StaticAddress';

import './AddressSelect.scss';

export interface AddressSelectProps {
    addresses: CustomerAddress[];
    selectedAddress?: Address;
    onSelectAddress(address: Address): void;
    onUseNewAddress(currentAddress?: Address): void;
}

const AddressSelectMenu: FunctionComponent<AddressSelectProps> = ({
    addresses,
    onSelectAddress,
    onUseNewAddress,
    selectedAddress,
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
                    <StaticAddress address={address} />
                </a>
            </li>
        ))}
    </ul>
);

const AddressSelect = ({
    addresses,
    selectedAddress,
    onSelectAddress,
    onUseNewAddress,
}: AddressSelectProps) => {
    const { shouldShowPayPalConnectLabel } = usePayPalConnectAddress();

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
                        />
                    }
                >
                    <AddressSelectButton
                        addresses={addresses}
                        selectedAddress={selectedAddress}
                    />
                </DropdownTrigger>
            </div>

            {shouldShowPayPalConnectLabel && <PoweredByPaypalConnectLabel />}
        </div>
    );
}

export default memo(AddressSelect);
