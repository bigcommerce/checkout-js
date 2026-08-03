import React, { type ReactNode } from 'react';

import { useCheckout } from '../checkout';

import { isEnhancedThemeEnabled } from './isEnhancedThemeEnabled';
import ThemeContext from './ThemeContext';

export interface ThemeProviderProps {
    children?: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const { selectedState: config } = useCheckout((state) => state.data.getConfig());

    const enhancedTheme = isEnhancedThemeEnabled(config);

    return <ThemeContext.Provider value={{ enhancedTheme }}>{children}</ThemeContext.Provider>;
};
