import { ShippingOption } from '@bigcommerce/checkout-sdk';
import React, { memo, useCallback, FunctionComponent } from 'react';

import { EMPTY_ARRAY } from '../../common/utility';
import { Checklist, ChecklistItem } from '../../ui/form';
import { LoadingOverlay } from '../../ui/loading';

import StaticShippingOption from './StaticShippingOption';

interface ShippingOptionListItemProps {
    consignmentId: string;
    shippingOption: ShippingOption;
}

// const messengerDeliveryText = 'Messenger Delivery Service (Within 11-20 Miles Radius) - We will inform you when your order is ready to be delivered';

const ShippingOptionListItem: FunctionComponent<ShippingOptionListItemProps> = ({
    consignmentId,
    shippingOption,
}) => {
    const renderLabel = useCallback(() => (
        <div className="shippingOptionLabel">
            <StaticShippingOption displayAdditionalInformation={ true } method={ shippingOption } />
        </div>
    ), [shippingOption]);

    return <ChecklistItem
        htmlId={ `shippingOptionRadio-${consignmentId}-${shippingOption.id}` }
        label={ renderLabel }
        value={ shippingOption.id }
    />;
};

export interface ShippingOptionListProps {
    consignmentId: string;
    inputName: string;
    isLoading: boolean;
    selectedShippingOptionId?: string;
    shippingOptions?: ShippingOption[];
    onSelectedOption(consignmentId: string, shippingOptionId: string): void;
    isMessengerDelivery: boolean;
    isShippingOnly: boolean;
}

const ShippingOptionsList: FunctionComponent<ShippingOptionListProps> = ({
    consignmentId,
    inputName,
    isLoading,
    shippingOptions = EMPTY_ARRAY,
    selectedShippingOptionId,
    onSelectedOption,
    isMessengerDelivery,
    isShippingOnly
 }) => {
    const handleSelect = useCallback((value: string) => {
        onSelectedOption(consignmentId, value);
    }, [
        consignmentId,
        onSelectedOption,
    ]);

    if (!shippingOptions.length) {
        return null;
    }

    return (
        <LoadingOverlay isLoading={ isLoading }>
            <Checklist
                aria-live="polite"
                defaultSelectedItemId={ selectedShippingOptionId }
                name={ inputName }
                onSelect={ handleSelect }
            >
                { shippingOptions.map(shippingOption => {
                    const listComponent = (
                        <ShippingOptionListItem
                            consignmentId={ consignmentId }
                            key={ shippingOption.id }
                            shippingOption={ shippingOption }
                        />
                    )

                    if (isMessengerDelivery)
                        if (shippingOption.type !== "shipping_pickupinstore")
                        return listComponent;
                        else return;

                    if (isShippingOnly)
                        if (shippingOption.type !== "shipping_pickupinstore")
                        return listComponent;
                        else return;
                    
                    return listComponent;
                }) }
            </Checklist>
        </LoadingOverlay>
    );
};

export default memo(ShippingOptionsList);
