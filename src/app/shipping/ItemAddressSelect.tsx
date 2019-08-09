import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { AddressSelect } from '../address';

import ShippableItem from './ShippableItem';

export interface ItemAddressSelectProps {
    item: ShippableItem;
    addresses: CustomerAddress[];
    onSelectAddress(address: Address, itemId: string): void;
    onUseNewAddress(address: Address | undefined, itemId: string): void;
}

const ItemAddressSelect: FunctionComponent<ItemAddressSelectProps> = ({
    item: {
        id,
        imageUrl,
        quantity,
        name,
        options,
        consignment,
    },
    addresses,
    onSelectAddress,
    onUseNewAddress,
}) => (
    <div className="consignment">
        <figure className="consignment-product-figure">
            { imageUrl &&
                <img src={ imageUrl } alt={ name } />
            }
        </figure>

        <div className="consignment-product-body">
            <h5 className="optimizedCheckout-contentPrimary">
                { quantity } x { name }
            </h5>

            { (options || []).map(({ name: optionName, value, nameId }) =>
                <ul
                    key={ nameId }
                    data-test="consigment-item-product-options"
                    className="product-options optimizedCheckout-contentSecondary"
                >
                    <li className="product-option">
                        { optionName } { value }
                    </li>
                </ul>
            )}

            <AddressSelect
                addresses={ addresses }
                selectedAddress={ consignment && consignment.shippingAddress }
                onUseNewAddress={ address => onUseNewAddress(address, id as string) }
                onSelectAddress={ address => onSelectAddress(address, id as string) }
            />
        </div>
    </div>
);

export default ItemAddressSelect;
