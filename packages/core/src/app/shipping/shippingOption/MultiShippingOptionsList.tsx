import { type ShippingOption } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo } from 'react';

import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { MultiShippingOptionsListItem } from './MultiShippingOptionsListItem';

interface MultiShippingOptionsListV2Props {
    consignmentId: string;
    isLoading: boolean;
    selectedShippingOptionId?: string;
    shippingOptions: ShippingOption[];
    onSelectedOption(consignmentId: string, shippingOptionId: string): void;
}

const MultiShippingOptionsListV2: FunctionComponent<MultiShippingOptionsListV2Props> = ({
    consignmentId,
    isLoading,
    shippingOptions,
    selectedShippingOptionId,
    onSelectedOption,
}) => {
    return (
        <LoadingOverlay isLoading={isLoading}>
            {shippingOptions.map((shippingOption) => (
                <MultiShippingOptionsListItem
                    consignmentId={consignmentId}
                    handleSelect={onSelectedOption}
                    key={shippingOption.id}
                    selectedShippingOptionId={selectedShippingOptionId}
                    shippingOption={shippingOption}
                />
            ))}
        </LoadingOverlay>
    );
};

export default memo(MultiShippingOptionsListV2);
