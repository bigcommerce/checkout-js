import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo, PureComponent, ReactNode } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import isEqualAddress from '../../address/isEqualAddress';
import { preventDefault } from '../../common/dom';
import { DropdownTrigger } from '../../ui/dropdown';

import PayPalAxoAddressSelectButton from './PayPalAxoAddressSelectButton';
import PayPalAxoStaticAddress from './PayPalAxoStaticAddress';
import PoweredByLabel from './PoweredByLabel';

import './AddressSelect.scss';

export interface PayPalAxoAddressSelectProps {
    addresses: CustomerAddress[];
    selectedAddress?: Address;
    onSelectAddress(address: Address): void;
    onUseNewAddress(currentAddress?: Address): void;
}

class PayPalAxoAddressSelect extends PureComponent<PayPalAxoAddressSelectProps> {
    render(): ReactNode {
        const { addresses, selectedAddress } = this.props;

        return (
            <div className="form-field">
                <div className="dropdown--select">
                    <DropdownTrigger
                        dropdown={
                            <PayPalAxoAddressSelectMenu
                                addresses={addresses}
                                onSelectAddress={this.handleSelectAddress}
                                onUseNewAddress={this.handleUseNewAddress}
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

                <PoweredByLabel />
            </div>
        );
    }

    private handleSelectAddress: (newAddress: Address) => void = (newAddress: Address) => {
        const { onSelectAddress, selectedAddress } = this.props;

        if (!isEqualAddress(selectedAddress, newAddress)) {
            onSelectAddress(newAddress);
        }
    };

    private handleUseNewAddress: () => void = () => {
        const { selectedAddress, onUseNewAddress } = this.props;

        onUseNewAddress(selectedAddress);
    };
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
        {addresses.map((address) => (
            <li className="dropdown-menu-item dropdown-menu-item--select" key={address.id}>
                <a href="#" onClick={preventDefault(() => onSelectAddress(address))}>
                    <PayPalAxoStaticAddress address={address} />
                </a>
            </li>
        ))}
    </ul>
);

export default memo(PayPalAxoAddressSelect);
