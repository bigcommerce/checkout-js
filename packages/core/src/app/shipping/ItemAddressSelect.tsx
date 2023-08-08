import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo, ReactNode, useCallback } from 'react';

import { AddressSelectProps } from '../address/AddressSelect';

import ShippableItem from './ShippableItem';

export interface ItemAddressSelectProps {
    item: ShippableItem;
    addresses: CustomerAddress[];
    onSelectAddress(address: Address, itemId: string, itemKey: string): void;
    onUseNewAddress(address: Address | undefined, itemId: string, itemKey: string): void;
    renderAddressSelect(props: AddressSelectProps): ReactNode;
}

const ItemAddressSelect: FunctionComponent<ItemAddressSelectProps> = ({
    item: { id, key, imageUrl, quantity, name, options, consignment },
    addresses,
    onSelectAddress,
    onUseNewAddress,
    renderAddressSelect,
}) => {
    const handleUseNewAddress = useCallback(
        (address: Address) => {
            onUseNewAddress(address, id as string, key);
        },
        [id, onUseNewAddress, key],
    );

    const handleSelectAddress = useCallback(
        (address: Address) => {
            onSelectAddress(address, id as string, key);
        },
        [id, key, onSelectAddress],
    );

    return (
        <div className="consignment">
            <figure className="consignment-product-figure">
                {imageUrl && <img alt={name} src={imageUrl} />}
            </figure>

            <div className="consignment-product-body">
                <h4 className="optimizedCheckout-contentPrimary">{`${quantity} x ${name}`}</h4>

                {(options || []).map(({ name: optionName, value, nameId }) => (
                    <ul
                        className="product-options optimizedCheckout-contentSecondary"
                        data-test="consigment-item-product-options"
                        key={nameId}
                    >
                        <li className="product-option">{`${optionName} ${value}`}</li>
                    </ul>
                ))}

                {renderAddressSelect({
                    addresses,
                    onSelectAddress: handleSelectAddress,
                    onUseNewAddress: handleUseNewAddress,
                    selectedAddress: consignment && consignment.shippingAddress,
                })}
            </div>
        </div>
    );
};

export default memo(ItemAddressSelect);
