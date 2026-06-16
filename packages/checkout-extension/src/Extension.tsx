import { type ExtensionRegion } from '@bigcommerce/checkout-sdk';
import React, { type ReactNode, useEffect } from 'react';

import { useCheckout, useExtensions } from '@bigcommerce/checkout/contexts';

import { extensionRegionToContainerMap } from './ExtensionRegionContainer';

interface ExtensionProps {
    region: ExtensionRegion;
}

export const Extension = ({ region }: ExtensionProps): ReactNode | null => {
    const {
        selectedState: { extensions, config, checkout },
    } = useCheckout(({ data }) => ({
        extensions: data.getExtensions(),
        config: data.getConfig(),
        checkout: data.getCheckout(),
    }));
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
    }, [containerId, isRegionEnabled, region]); // eslint-disable-line react-hooks/exhaustive-deps

    if (isRegionEnabled && containerId !== '') {
        return <div id={containerId} />;
    }

    return null;
};
