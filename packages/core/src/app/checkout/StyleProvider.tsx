import React, { createContext, ReactNode } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { isExperimentEnabled } from '../common/utility';

export interface StyleContextProps {
    newFontStyle: boolean;
}

export const StyleContext = createContext<StyleContextProps | undefined>(undefined);

export interface StyleProviderProps {
    children?: ReactNode;
}

export const StyleProvider = ({
    children,
}: StyleProviderProps) => {
    const {
        checkoutState: {
            data: { getConfig }
        }
    } = useCheckout();

    const config = getConfig();

    let newFontStyle = false;

    if (config) {
        newFontStyle = isExperimentEnabled(config.checkoutSettings, "CHECKOUT-7962_update_font_style_on_checkout_page");
    }

    return (
        <StyleContext.Provider value={{ newFontStyle }}>
            {children}
        </StyleContext.Provider>
    )
};


