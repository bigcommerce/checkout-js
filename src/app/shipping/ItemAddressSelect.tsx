import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { memo, useCallback, FunctionComponent } from 'react';

import { AddressSelect } from '../address';

import ShippableItem from './ShippableItem';

export interface ItemAddressSelectProps {
    item: ShippableItem;
    addresses: CustomerAddress[];
    onSelectAddress(address: Address, itemId: string, itemKey: string): void;
    onUseNewAddress(address: Address | undefined, itemId: string, itemKey: string): void;
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
        onUseNewAddress(address, id as string, key);
    }, [
        id,
        onUseNewAddress,
        key,
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
                <img alt={ name } src={ imageUrl } /> }
        </figure>

        <div className="consignment-product-body">
            <h5 className="optimizedCheckout-contentPrimary">
                { `${quantity} x ${name}` }
            </h5>

            { (options || []).map(({ name: optionName, value, nameId }) =>
                <ul
                    className="product-options optimizedCheckout-contentSecondary"
                    data-test="consigment-item-product-options"
                    key={ nameId }
                >
                    <li className="product-option">
                        { `${optionName } ${value}` }
                    </li>
                </ul>
            ) }

            <AddressSelect
                addresses={ addresses }
                onSelectAddress={ handleSelectAddress }
                onUseNewAddress={ handleUseNewAddress }
                selectedAddress={ consignment && consignment.shippingAddress }
            />
        </div>
    </div>;
};

export default memo(ItemAddressSelect);
