import { createContext, useContext } from 'react';

export interface ThemeContextProps {
    enhancedTheme: boolean;
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
