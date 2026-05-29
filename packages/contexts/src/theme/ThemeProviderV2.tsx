import React, { type FC, type PropsWithChildren } from 'react';

import { useCheckout } from '../checkout/useCheckout';

import ThemeContext from './ThemeContext';

export const ThemeProviderV2: FC<PropsWithChildren> = ({ children }) => {
    const { selectedState: config } = useCheckout((state) => state.data.getConfig());

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
