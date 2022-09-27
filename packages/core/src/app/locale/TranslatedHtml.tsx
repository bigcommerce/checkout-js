import DOMPurify from 'dompurify';
import React, { FunctionComponent } from 'react';

import withLanguage, { WithLanguageProps } from './withLanguage';

export interface TranslatedHtmlProps {
    id: string;
    data?: any;
}

const TranslatedHtml: FunctionComponent<TranslatedHtmlProps & WithLanguageProps> = ({
    data,
    id,
    language,
}) => (
    <span
        dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(language.translate(id, data), { ADD_ATTR: ['target'] }),
        }}
    />
);

export default withLanguage(TranslatedHtml);
