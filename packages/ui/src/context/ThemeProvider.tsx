import React, { ReactNode } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import ThemeContext from './ThemeContext';

export interface ThemeProviderProps {
    children?: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
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
        <ThemeContext.Provider value={{ newFontStyle, themeV2 }}>{children}</ThemeContext.Provider>
    );
};
