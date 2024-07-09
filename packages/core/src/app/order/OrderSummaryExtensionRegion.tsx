import { ExtensionRegion } from '@bigcommerce/checkout-sdk';
import React, { useEffect } from 'react';

import { ExtensionRegionContainer, useExtensions } from '@bigcommerce/checkout/checkout-extension';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

export const ExtensionRegionSummaryAfter = () => {
    const {
        checkoutState: {
            data: { getExtensions, getConfig, getCheckout },
        },
    } = useCheckout();
    const extensions = getExtensions();
    const config = getConfig();
    const checkout = getCheckout();
    const { extensionService, isExtensionEnabled } = useExtensions();
    const isSummaryAfterExtensionRegionEnabled =
        extensions &&
        config &&
        checkout &&
        isExtensionEnabled() &&
        extensionService.isRegionEnabled(ExtensionRegion.SummaryAfter);

    useEffect(() => {
        if (isSummaryAfterExtensionRegionEnabled) {
            void extensionService.renderExtension(
                ExtensionRegionContainer.SummaryAfter,
                ExtensionRegion.SummaryAfter,
            );

            return () => {
                extensionService.removeListeners(ExtensionRegion.SummaryAfter);
            };
        }
    }, [extensionService, isSummaryAfterExtensionRegionEnabled]);

    if (isSummaryAfterExtensionRegionEnabled) {
        return <div id={ExtensionRegionContainer.SummaryAfter} />;
    }

    return null;
};
