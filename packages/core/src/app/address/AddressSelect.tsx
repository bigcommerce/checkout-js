import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo, PureComponent, ReactNode } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { preventDefault } from '../common/dom';
import { DropdownTrigger } from '../ui/dropdown';

import AddressSelectButton from './AddressSelectButton';
import isEqualAddress from './isEqualAddress';
import StaticAddress from './StaticAddress';

import './AddressSelect.scss';

export interface AddressSelectProps {
    addresses: Array<CustomerAddress | Address>;
    selectedAddress?: Address;
    onSelectAddress(address: Address): void;
    onUseNewAddress(currentAddress?: Address): void;
}

class AddressSelect extends PureComponent<AddressSelectProps> {
    render(): ReactNode {
        const { addresses, selectedAddress } = this.props;

        return (
            <div className="form-field">
                <div className="dropdown--select">
                    <DropdownTrigger
                        dropdown={
                            <AddressSelectMenu
                                addresses={addresses}
                                onSelectAddress={this.handleSelectAddress}
                                onUseNewAddress={this.handleUseNewAddress}
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
        {addresses.map((address, index) => (
            <li className="dropdown-menu-item dropdown-menu-item--select" key={index}>
                <a href="#" onClick={preventDefault(() => onSelectAddress(address))}>
                    <StaticAddress address={address} />
                </a>
            </li>
        ))}
    </ul>
);

export default memo(AddressSelect);
