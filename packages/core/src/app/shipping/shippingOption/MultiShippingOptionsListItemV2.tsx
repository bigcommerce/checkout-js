import { ShippingOption } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback, useEffect } from 'react';

import { RadioInput } from '@bigcommerce/checkout/ui';

import { ShopperCurrency } from '../../currency';

interface MultiShippingOptionsListItemV2Props {
    consignmentId: string;
    selectedShippingOptionId?: string;
    shippingOption: ShippingOption;
    handleSelect: (value: string) => void;
}

export const MultiShippingOptionsListItemV2: FunctionComponent<
    MultiShippingOptionsListItemV2Props
> = ({ consignmentId, selectedShippingOptionId, shippingOption, handleSelect }) => {
    const label = (
        <>
            {`${shippingOption.description} - `}
            <ShopperCurrency amount={shippingOption.cost} />
        </>
    );

    const selectThisOption = useCallback(() => {
        handleSelect(shippingOption.id);
    }, [handleSelect, shippingOption.id]);

    useEffect(() => {
        if (!selectedShippingOptionId && shippingOption.isRecommended) {
            selectThisOption();
        }
    }, [selectedShippingOptionId, shippingOption.isRecommended, selectThisOption]);

    return (
        <button className="shipping-option-item" onClick={selectThisOption}>
            <ul>
                <RadioInput
                    checked={selectedShippingOptionId === shippingOption.id}
                    key={shippingOption.id}
                    label={label}
                    name={`${consignmentId}-shippingMethod`}
                    readOnly
                    value={shippingOption.id}
                />
            </ul>
        </button>
    );
};
