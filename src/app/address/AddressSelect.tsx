import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { Component, FunctionComponent, ReactNode } from 'react';

import { preventDefault } from '../common/dom';
import { TranslatedString } from '../language';
import { DropdownTrigger } from '../ui/dropdown';

import StaticAddress from './staticAddress/StaticAddress';
import isEqualAddress from './util/isEqualAddress';

export interface AddressSelectProps {
    addresses: CustomerAddress[];
    selectedAddress?: Address;
    onSelectAddress(address: Address): void;
    onUseNewAddress(currentAddress?: Address): void;
}

class AddressSelect extends Component<AddressSelectProps> {
    render(): ReactNode {
        const {
            addresses,
            selectedAddress,
            onUseNewAddress,
        } = this.props;

        return (
            <div className="form-field">
                <div className="dropdown--select" role="combobox">
                    <DropdownTrigger dropdown={
                        <AddressSelectMenu
                            addresses={ addresses }
                            onSelectAddress={ this.onSelectAddress }
                            onUseNewAddress={ () => onUseNewAddress(selectedAddress) }
                            selectedAddress={ selectedAddress }
                        />
                    }>
                        <AddressSelectButton
                            addresses={ addresses }
                            selectedAddress={ selectedAddress }
                        />
                    </DropdownTrigger>
                </div>
            </div>
        );
    }

    private onSelectAddress: (newAddress: Address) => void = (newAddress: Address) => {
        const {
            onSelectAddress,
            selectedAddress,
        } = this.props;

        if (!isEqualAddress(selectedAddress, newAddress)) {
            onSelectAddress(newAddress);
        }
    };
}

const AddressSelectMenu: FunctionComponent<AddressSelectProps> = ({
    addresses,
    onSelectAddress,
    onUseNewAddress,
    selectedAddress,
}) => (
    <ul
        className="dropdown-menu instrumentSelect-dropdownMenu"
        id="addressDropdown"
    >
        <li className="dropdown-menu-item dropdown-menu-item--select">
            <a href="#" onClick={ preventDefault(() => onUseNewAddress(selectedAddress)) }>
                <TranslatedString id="address.enter_address_action" />
            </a>
        </li>
        { addresses.map(address => (
            <li
                className="dropdown-menu-item dropdown-menu-item--select"
                key={ address.id }
            >
                <a href="#" onClick={ preventDefault(() => onSelectAddress(address)) }>
                    <StaticAddress address={ address } />
                </a>
            </li>
        )) }
    </ul>
);

type AddressSelectButtonProps = Pick<AddressSelectProps, 'selectedAddress' | 'addresses'>;

const AddressSelectButton: FunctionComponent<AddressSelectButtonProps> = ({
    selectedAddress,
}) => (
    <a
        className="button dropdown-button dropdown-toggle--select"
        href="#"
        id="addressToggle"
        onClick={ preventDefault() }
    >
        { selectedAddress ?
            <StaticAddress address={ selectedAddress } /> :
            <TranslatedString id="address.enter_address_action" />
        }
    </a>
);

export default AddressSelect;
