import React, { FunctionComponent } from 'react';

import getLanguageService from './getLanguageService';
import LocaleContext, { LocaleContextType, useLocale } from './LocaleContext';

export interface TranslatedStringProps {
    id: string;
    data?: any;
}

const TranslatedString: FunctionComponent<TranslatedStringProps> = ({ data, id }) => {
    const { language } = useLocale();

    return <>{language.translate(id, data)}</>;
};

// const TranslatedString: FunctionComponent<TranslatedStringProps> = (props) => {
//     const localeContextValue: LocaleContextType = {
//         language: getLanguageService(),
//     };

//     return (
//         <LocaleContext.Provider value={localeContextValue}>
//             <TranslatedStringWithContext {...props} />
//         </LocaleContext.Provider>
//     );
// };

export default TranslatedString;
