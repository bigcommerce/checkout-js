import { ShippingOption } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { RadioInput } from '@bigcommerce/checkout/ui';

import { ShopperCurrency } from '../../currency';

interface MultiShippingOptionsListItemV2Props {
    consignmentId: string;
    selectedShippingOptionId?: string;
    shippingOption: ShippingOption;
    handleSelect: (consignmentId: string, shippingOptionId: string) => void;
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

    const selectThisOption = () => {
        handleSelect(consignmentId, shippingOption.id);
    };

    return (
        <ul className="shipping-option-item">
            <RadioInput
                checked={selectedShippingOptionId === shippingOption.id}
                id={`shippingOption-${consignmentId}-${shippingOption.id}`}
                key={`key-${consignmentId}-${shippingOption.id}`}
                label={label}
                name={`${consignmentId}-shippingMethod`}
                onClick={selectThisOption}
                readOnly
                value={shippingOption.id}
            />
        </ul>
    );
};
