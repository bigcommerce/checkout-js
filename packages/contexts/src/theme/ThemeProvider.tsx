import React, { type ReactNode } from 'react';

import { useCheckout } from '../checkout';

import ThemeContext, { type ThemeVariant } from './ThemeContext';

export interface ThemeProviderProps {
    children?: ReactNode;
}

const THEME_VARIANTS: ThemeVariant[] = ['light', 'bold', 'warm'];

function normalizeThemeVariant(value: unknown): ThemeVariant {
    if (typeof value !== 'string') return 'bold';

    const normalized = value.toLowerCase().trim();

    return THEME_VARIANTS.includes(normalized as ThemeVariant)
        ? (normalized as ThemeVariant)
        : 'bold';
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const {
        checkoutState: {
            data: { getConfig },
        },
    } = useCheckout();

    const config = getConfig();

    let useNewTheme = false;

    if (config) {
        useNewTheme = Boolean(
            config.checkoutSettings.features['CHECKOUT-7962.update_font_style_on_checkout_page'] ??
                true,
        );
    }

    const themeV2 =
        (window.location.search && window.location.search.includes('v2')) || useNewTheme;

    const rawVariant = (config?.checkoutSettings as { themeVariant?: string } | undefined)
        ?.themeVariant;
    const themeVariant = normalizeThemeVariant(rawVariant);

    return (
        <ThemeContext.Provider value={{ themeV2, themeVariant }}>{children}</ThemeContext.Provider>
    );
};
