import React, { ReactNode } from 'react';

import { useCheckout } from './CheckoutContext';
import StyleContext from './StyleContext';

export interface StyleProviderProps {
    children?: ReactNode;
}

export const StyleProvider = ({ children }: StyleProviderProps) => {
    const {
        checkoutState: {
            data: { getConfig },
        },
    } = useCheckout();

    const config = getConfig();

    let newFontStyle = false;

    if (config) {
        newFontStyle = Boolean(
            config.checkoutSettings.features['CHECKOUT-7962.update_font_style_on_checkout_page'] ??
                true,
        );
    }

    return <StyleContext.Provider value={{ newFontStyle }}>{children}</StyleContext.Provider>;
};
