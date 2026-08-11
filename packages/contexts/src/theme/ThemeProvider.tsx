import React, { type ReactNode } from 'react';

import { useCheckout } from '../checkout';

import { isEnhancedThemeV1Enabled } from './isEnhancedThemeV1Enabled';
import ThemeContext from './ThemeContext';

export interface ThemeProviderProps {
    children?: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const { selectedState: config } = useCheckout((state) => state.data.getConfig());

    const enhancedThemeV1 = isEnhancedThemeV1Enabled(config);

    return <ThemeContext.Provider value={{ enhancedThemeV1 }}>{children}</ThemeContext.Provider>;
};
