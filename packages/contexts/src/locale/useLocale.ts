import { useContext } from 'react';

import { LocaleContext } from './LocaleContext';

export function useLocale() {
    const context = useContext(LocaleContext);

    if (!context) {
        throw new Error('useLocale must be used within a LocaleContextProvider');
    }

    return context;
}
