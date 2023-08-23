import { ExtensionRegion } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo, useEffect } from 'react';

import { ExtensionRegionContainer, useExtensions } from '@bigcommerce/checkout/checkout-extension';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { Legend } from '../ui/form';

interface ShippingHeaderProps {
    isMultiShippingMode: boolean;
    isGuest: boolean;
    shouldShowMultiShipping: boolean;
    onMultiShippingChange(): void;
}

const ShippingHeader: FunctionComponent<ShippingHeaderProps> = ({
    isMultiShippingMode,
    isGuest,
    onMultiShippingChange,
    shouldShowMultiShipping,
}) => {
    const { extensionService, isExtensionEnabled } = useExtensions();
    const isExtensionRegionEnabled = Boolean(
        isExtensionEnabled() &&
            extensionService.isRegionEnabled(ExtensionRegion.ShippingShippingAddressFormBefore),
    );

    useEffect(() => {
        if (isExtensionRegionEnabled) {
            void extensionService.renderExtension(
                ExtensionRegionContainer.ShippingShippingAddressFormBefore,
                ExtensionRegion.ShippingShippingAddressFormBefore,
            );

            return () => {
                extensionService.removeListeners(ExtensionRegion.ShippingShippingAddressFormBefore);
            };
        }
    }, [extensionService, isExtensionRegionEnabled]);

    return (
        <>
            {isExtensionRegionEnabled && (
                <div id={ExtensionRegionContainer.ShippingShippingAddressFormBefore} />
            )}
            <div className="form-legend-container">
                <Legend testId="shipping-address-heading">
                    <TranslatedString
                        id={
                            isMultiShippingMode
                                ? isGuest
                                    ? 'shipping.multishipping_address_heading_guest'
                                    : 'shipping.multishipping_address_heading'
                                : 'shipping.shipping_address_heading'
                        }
                    />
                </Legend>

                {shouldShowMultiShipping && (
                    <a
                        data-test="shipping-mode-toggle"
                        href="#"
                        onClick={preventDefault(onMultiShippingChange)}
                    >
                        <TranslatedString
                            id={isMultiShippingMode ? 'shipping.ship_to_single' : 'shipping.ship_to_multi'}
                        />
                    </a>
                )}
            </div>
        </>
    );
}

export default memo(ShippingHeader);
