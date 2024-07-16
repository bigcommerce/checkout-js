import { ExtensionRegion } from '@bigcommerce/checkout-sdk';
import React, { useEffect } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { extensionRegionToContainerMap } from './ExtensionRegionContainer';
import { useExtensions } from './useExtensions';

interface ExtensionProps {
    region: ExtensionRegion;
}

export const Extension = ({ region }: ExtensionProps): React.JSX.Element | null => {
    const {
        checkoutState: {
            data: { getExtensions, getConfig, getCheckout },
        },
    } = useCheckout();
    const extensions = getExtensions();
    const config = getConfig();
    const checkout = getCheckout();
    const { extensionService } = useExtensions();
    const isRegionEnabled =
        extensions && config && checkout && extensionService.isRegionEnabled(region);
    const containerId = extensionRegionToContainerMap[region];

    useEffect(() => {
        if (isRegionEnabled) {
            void extensionService.renderExtension(containerId, region);

            return () => {
                extensionService.removeListeners(region);
            };
        }
    }, [containerId, extensionService, isRegionEnabled, region]);

    if (isRegionEnabled) {
        return <div id={containerId} />;
    }

    return null;
};
