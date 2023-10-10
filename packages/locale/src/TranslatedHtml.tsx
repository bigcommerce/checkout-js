import DOMPurify from 'dompurify';
import React, { FunctionComponent } from 'react';

import { useLocale } from './LocaleContext';

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

export default TranslatedHtml;
