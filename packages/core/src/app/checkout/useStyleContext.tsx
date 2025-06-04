import { useContext } from 'react';

import { StyleContext } from './StyleProvider';

export const useStyleContext = () => {
    const styleContext = useContext(StyleContext);

    if (!styleContext) {
        throw new Error('useStyleContext must be used within an <StyleContextProvider>');
    }

    return styleContext;
};
