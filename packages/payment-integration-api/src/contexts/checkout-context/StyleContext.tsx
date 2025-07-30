import { createContext, useContext } from 'react';

export interface StyleContextProps {
    newFontStyle: boolean;
    themeV2: boolean;
}

const StyleContext = createContext<StyleContextProps | undefined>(undefined);

export const useStyleContext = () => {
    const styleContext = useContext(StyleContext);

    if (!styleContext) {
        throw new Error('useStyleContext must be used within an <StyleContextProvider>');
    }

    return styleContext;
};

export default StyleContext;
