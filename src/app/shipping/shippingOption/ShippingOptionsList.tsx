import { ShippingOption } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { Checklist, ChecklistItem } from '../../ui/form';
import { LoadingOverlay } from '../../ui/loading';

import StaticShippingOption from './StaticShippingOption';

interface ShippingOptionListProps {
    consignmentId: string;
    inputName: string;
    isLoading: boolean;
    selectedShippingOptionId?: string;
    shippingOptions?: ShippingOption[];
    onSelectedOption(consignmentId: string, shippingOptionId: string): void;
}

const ShippingOptionsList: FunctionComponent<ShippingOptionListProps> = ({
    consignmentId,
    inputName,
    isLoading,
    shippingOptions,
    selectedShippingOptionId,
    onSelectedOption,
 }) => {
    if (!shippingOptions || !shippingOptions.length) {
        return null;
    }

    return (
        <LoadingOverlay isLoading={ isLoading }>
            <Checklist
                aria-live="polite"
                defaultSelectedItemId={ selectedShippingOptionId }
                name={ inputName }
                onSelect={ value => onSelectedOption(consignmentId, value) }
            >
                { shippingOptions.map(shippingOption => (
                    <ChecklistItem
                        htmlId={ `shippingOptionRadio-${consignmentId}-${shippingOption.id}` }
                        key={ shippingOption.id }
                        label={ () =>
                            <div className="shippingOptionLabel">
                                <StaticShippingOption method={ shippingOption } />
                            </div>
                        }
                        value={ shippingOption.id }
                    />
                )) }
            </Checklist>
        </LoadingOverlay>
    );
};

export default ShippingOptionsList;
