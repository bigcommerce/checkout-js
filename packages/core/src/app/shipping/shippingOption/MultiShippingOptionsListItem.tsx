import { ShippingOption } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { useStyleContext } from '@bigcommerce/checkout/payment-integration-api';
import { RadioInput } from '@bigcommerce/checkout/ui';

import { ShopperCurrency } from '../../currency';

interface MultiShippingOptionsListItemProps {
    consignmentId: string;
    selectedShippingOptionId?: string;
    shippingOption: ShippingOption;
    handleSelect: (consignmentId: string, shippingOptionId: string) => void;
}

export const MultiShippingOptionsListItem: FunctionComponent<
    MultiShippingOptionsListItemProps
> = ({ consignmentId, selectedShippingOptionId, shippingOption, handleSelect }) => {
    const { newFontStyle } = useStyleContext();

    const label = (
        <span className={newFontStyle ? 'body-regular' : ''}>
            {`${shippingOption.description} - `}
            <ShopperCurrency amount={shippingOption.cost} />
        </span>
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
