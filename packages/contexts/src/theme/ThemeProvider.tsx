import React, { type ReactNode } from 'react';

import { useCheckout } from '../checkout';

import { isThemeV2Enabled } from './isThemeV2Enabled';
import ThemeContext from './ThemeContext';

export interface ThemeProviderProps {
    children?: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const { selectedState: config } = useCheckout((state) => state.data.getConfig());

    const themeV2 = isThemeV2Enabled(config);

    return <ThemeContext.Provider value={{ themeV2 }}>{children}</ThemeContext.Provider>;
};
