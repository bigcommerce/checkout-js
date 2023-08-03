import { Address } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import isEqualAddress from '../../address/isEqualAddress';
import { preventDefault } from '../../common/dom';
import { DropdownTrigger } from '../../ui/dropdown';

import PayPalAxoAddressSelectButton from './PayPalAxoAddressSelectButton';
import PayPalAxoStaticAddress from './PayPalAxoStaticAddress';
import PoweredByPaypalConnectLabel from './PoweredByPaypalConnectLabel';
import usePayPalConnectAddress from './usePayPalConnectAddress';

import '../AddressSelect.scss';

export interface PayPalAxoAddressSelectProps {
    addresses: Address[];
    selectedAddress?: Address;
    onSelectAddress(address: Address): void;
    onUseNewAddress(currentAddress?: Address): void;
}

const PayPalAxoAddressSelect = ({ addresses, selectedAddress, onSelectAddress, onUseNewAddress }: PayPalAxoAddressSelectProps) => {
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
                        <PayPalAxoAddressSelectMenu
                            addresses={addresses}
                            onSelectAddress={handleSelectAddress}
                            onUseNewAddress={handleUseNewAddress}
                            selectedAddress={selectedAddress}
                        />
                    }
                >
                    <PayPalAxoAddressSelectButton
                        addresses={addresses}
                        selectedAddress={selectedAddress}
                    />
                </DropdownTrigger>
            </div>

            {shouldShowPayPalConnectLabel() && <PoweredByPaypalConnectLabel />}
        </div>
    );
}

const PayPalAxoAddressSelectMenu: FunctionComponent<PayPalAxoAddressSelectProps> = ({
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
        {addresses.map((address, index) => (
            <li className="dropdown-menu-item dropdown-menu-item--select" key={index}>
                <a href="#" onClick={preventDefault(() => onSelectAddress(address))}>
                    <PayPalAxoStaticAddress address={address} />
                </a>
            </li>
        ))}
    </ul>
);

export default memo(PayPalAxoAddressSelect);
