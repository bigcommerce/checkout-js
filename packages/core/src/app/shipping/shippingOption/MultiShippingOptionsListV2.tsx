import { ShippingOption } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { MultiShippingOptionsListItemV2 } from './MultiShippingOptionsListItemV2';

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
                <MultiShippingOptionsListItemV2
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
