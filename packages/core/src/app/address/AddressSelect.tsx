import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { memo, FunctionComponent, PureComponent, ReactNode } from 'react';

import { preventDefault } from '../common/dom';
import { TranslatedString } from '../locale';
import { DropdownTrigger } from '../ui/dropdown';

import isEqualAddress from './isEqualAddress';
import './AddressSelect.scss';
import AddressSelectButton from './AddressSelectButton';
import StaticAddress from './StaticAddress';

export interface AddressSelectProps {
    addresses: CustomerAddress[];
    selectedAddress?: Address;
    onSelectAddress(address: Address): void;
    onUseNewAddress(currentAddress?: Address): void;
}

class AddressSelect extends PureComponent<AddressSelectProps> {
    render(): ReactNode {
        const {
            addresses,
            selectedAddress,
        } = this.props;

        return (
            <div className="form-field">
                <div className="dropdown--select">
                    <DropdownTrigger
                        dropdown={
                            <AddressSelectMenu
                                addresses={ addresses }
                                onSelectAddress={ this.handleSelectAddress }
                                onUseNewAddress={ this.handleUseNewAddress }
                                selectedAddress={ selectedAddress }
                            />
                        }
                    >
                        <AddressSelectButton
                            addresses={ addresses }
                            selectedAddress={ selectedAddress }
                        />
                    </DropdownTrigger>
                </div>
            </div>
        );
    }

    private handleSelectAddress: (newAddress: Address) => void = (newAddress: Address) => {
        const {
            onSelectAddress,
            selectedAddress,
        } = this.props;

        if (!isEqualAddress(selectedAddress, newAddress)) {
            onSelectAddress(newAddress);
        }
    };

    private handleUseNewAddress: () => void = () => {
        const {
            selectedAddress,
            onUseNewAddress,
        } = this.props;

        onUseNewAddress(selectedAddress);
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
            <a
                data-test="add-new-address"
                href="#"
                onClick={ preventDefault(() => onUseNewAddress(selectedAddress)) }
            >
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

export default memo(AddressSelect);
