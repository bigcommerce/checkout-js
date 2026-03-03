import { createContext, useContext } from 'react';

/** Theme variant from Stencil (bcapp). Affects colour and contrast for ThemeV2. */
export type ThemeVariant = 'light' | 'bold' | 'warm';

export interface ThemeContextProps {
    themeV2: boolean;
    /** Resolved theme variant for ThemeV2. Used for variant-specific styling (e.g. Bold theme colours). */
    themeVariant: ThemeVariant;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useThemeContext = () => {
    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error('useThemeContext must be used within an <ThemeContextProvider>');
    }

    return themeContext;
};

export default ThemeContext;
