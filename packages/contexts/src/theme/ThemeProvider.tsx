import React, { type ReactNode } from 'react';

import { useCheckout } from '../checkout';

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

    let themeV2 = false;

    if (config) {
        const newThemeExperimentEnabled = Boolean(
            config.checkoutSettings.features['CHECKOUT-7962.update_font_style_on_checkout_page'] ??
                true,
        );
        const newThemeSettingEnabled = Boolean(
            config.checkoutSettings.checkoutUserExperienceSettings.checkoutV2Theme ?? false,
        );

        themeV2 = newThemeSettingEnabled && newThemeExperimentEnabled;
    }

    return <ThemeContext.Provider value={{ themeV2 }}>{children}</ThemeContext.Provider>;
};
