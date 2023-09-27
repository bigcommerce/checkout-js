import DOMPurify from 'dompurify';
import React, { FunctionComponent } from 'react';

import getLanguageService from './getLanguageService';
import LocaleContext, { LocaleContextType, useLocale } from './LocaleContext';

export interface TranslatedHtmlProps {
    id: string;
    data?: any;
}

export const TranslatedHtml: FunctionComponent<TranslatedHtmlProps> = ({ data, id }) => {
    const { language } = useLocale();

    return (
        <span
            dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(language.translate(id, data), { ADD_ATTR: ['target'] }),
            }}
        />
    );
};

// const TranslatedHtml: FunctionComponent<TranslatedHtmlProps> = (props) => {
//     const localeContextValue: LocaleContextType = {
//         language: getLanguageService(),
//     };

//     return (
//         <LocaleContext.Provider value={localeContextValue}>
//             <TranslatedHtmlWithContext {...props} />
//         </LocaleContext.Provider>
//     );
// };

export default TranslatedHtml;
