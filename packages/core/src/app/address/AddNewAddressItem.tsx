import { type Address } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';

interface AddNewAddressItemProps {
    selectedAddress?: Address;
    onUseNewAddress(currentAddress?: Address): void;
}

export const AddNewAddressItem: FunctionComponent<AddNewAddressItemProps> = ({
    onUseNewAddress,
    selectedAddress,
}) => (
    <li className="dropdown-menu-item dropdown-menu-item--select">
        <a
            data-test="add-new-address"
            href="#"
            onClick={preventDefault(() => onUseNewAddress(selectedAddress))}
        >
            <TranslatedString id="address.enter_address_action" />
        </a>
    </li>
);
