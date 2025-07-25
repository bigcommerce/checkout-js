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

    const themeV2 =
        (window.location.search && window.location.search.includes('v2')) || newFontStyle;

    return (
        <StyleContext.Provider value={{ newFontStyle, themeV2 }}>{children}</StyleContext.Provider>
    );
};
