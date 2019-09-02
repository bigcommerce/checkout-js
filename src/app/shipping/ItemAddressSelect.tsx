import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { memo, useCallback, FunctionComponent } from 'react';

import { AddressSelect } from '../address';

import ShippableItem from './ShippableItem';

export interface ItemAddressSelectProps {
    item: ShippableItem;
    addresses: CustomerAddress[];
    onSelectAddress(address: Address, itemId: string, itemKey: string): void;
    onUseNewAddress(address: Address | undefined, itemId: string): void;
}

const ItemAddressSelect: FunctionComponent<ItemAddressSelectProps> = ({
    item: {
        id,
        key,
        imageUrl,
        quantity,
        name,
        options,
        consignment,
    },
    addresses,
    onSelectAddress,
    onUseNewAddress,
}) => {
    const handleUseNewAddress = useCallback((address: Address) => {
        onUseNewAddress(address, id as string);
    }, [
        id,
        onUseNewAddress,
    ]);

    const handleSelectAddress = useCallback((address: Address) => {
        onSelectAddress(address, id as string, key);
    }, [
        id,
        key,
        onSelectAddress,
    ]);

    return <div className="consignment">
        <figure className="consignment-product-figure">
            { imageUrl &&
                <img src={ imageUrl } alt={ name } /> }
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
            ) }

            <AddressSelect
                addresses={ addresses }
                selectedAddress={ consignment && consignment.shippingAddress }
                onUseNewAddress={ handleUseNewAddress }
                onSelectAddress={ handleSelectAddress }
            />
        </div>
    </div>;
};

export default memo(ItemAddressSelect);
