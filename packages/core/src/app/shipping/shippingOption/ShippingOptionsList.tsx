import { ExtensionRegion, ShippingOption } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo, useCallback, useEffect } from 'react';

import { ExtensionRegionContainer, useExtensions } from '@bigcommerce/checkout/checkout-extension';

import { EMPTY_ARRAY } from '../../common/utility';
import { Checklist, ChecklistItem } from '../../ui/form';
import { LoadingOverlay } from '../../ui/loading';

import StaticShippingOption from './StaticShippingOption';

interface ShippingOptionListItemProps {
    consignmentId: string;
    isMultiShippingMode: boolean;
    selectedShippingOptionId?: string;
    shippingOption: ShippingOption;
}

const ShippingOptionListItem: FunctionComponent<ShippingOptionListItemProps> = ({
    consignmentId,
    isMultiShippingMode,
    selectedShippingOptionId,
    shippingOption,
}) => {
    const isSelected = selectedShippingOptionId === shippingOption.id;
    const { extensionService, isExtensionEnabled } = useExtensions();
    const isExtensionRegionEnabled = Boolean(
        isExtensionEnabled() &&
            !isMultiShippingMode &&
            extensionService.isRegionEnabled(ExtensionRegion.ShippingSelectedShippingMethod),
    );

    const renderLabel = useCallback(
        () => (
            <div className="shippingOptionLabel">
                <StaticShippingOption displayAdditionalInformation={true} method={shippingOption} />
                {isSelected && isExtensionRegionEnabled && (
                    <div id={ExtensionRegionContainer.ShippingSelectedShippingMethod} />
                )}
            </div>
        ),
        [isExtensionRegionEnabled, isSelected, shippingOption],
    );

    useEffect(() => {
        if (isSelected && isExtensionRegionEnabled) {
            void extensionService.renderExtension(
                ExtensionRegionContainer.ShippingSelectedShippingMethod,
                ExtensionRegion.ShippingSelectedShippingMethod,
            );

            return () => {
                extensionService.removeListeners(ExtensionRegion.ShippingSelectedShippingMethod);
            };
        }
    }, [extensionService, isExtensionRegionEnabled, isSelected]);

    return (
        <ChecklistItem
            htmlId={`shippingOptionRadio-${consignmentId}-${shippingOption.id}`}
            label={renderLabel}
            value={shippingOption.id}
        />
    );
};

export interface ShippingOptionListProps {
    consignmentId: string;
    inputName: string;
    isLoading: boolean;
    isMultiShippingMode: boolean;
    selectedShippingOptionId?: string;
    shippingOptions?: ShippingOption[];
    onSelectedOption(consignmentId: string, shippingOptionId: string): void;
}

const ShippingOptionsList: FunctionComponent<ShippingOptionListProps> = ({
    consignmentId,
    inputName,
    isLoading,
    isMultiShippingMode,
    shippingOptions = EMPTY_ARRAY,
    selectedShippingOptionId,
    onSelectedOption,
}) => {
    const handleSelect = useCallback(
        (value: string) => {
            onSelectedOption(consignmentId, value);
        },
        [consignmentId, onSelectedOption],
    );

    if (!shippingOptions.length) {
        return null;
    }

    return (
        <LoadingOverlay isLoading={isLoading}>
            <Checklist
                aria-live="polite"
                defaultSelectedItemId={selectedShippingOptionId}
                name={inputName}
                onSelect={handleSelect}
            >
                {shippingOptions.map((shippingOption) => (
                    <ShippingOptionListItem
                        consignmentId={consignmentId}
                        isMultiShippingMode={isMultiShippingMode}
                        key={shippingOption.id}
                        selectedShippingOptionId={selectedShippingOptionId}
                        shippingOption={shippingOption}
                    />
                ))}
            </Checklist>
        </LoadingOverlay>
    );
};

export default memo(ShippingOptionsList);
