import { type ShippingOption } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
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
    const { themeV2 } = useThemeContext();

    const label = (
        <span className={themeV2 ? 'body-regular' : ''}>
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
