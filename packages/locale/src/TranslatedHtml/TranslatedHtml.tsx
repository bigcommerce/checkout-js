import { TranslationData } from '@bigcommerce/checkout-sdk';
import DOMPurify from 'dompurify';
import React, { FunctionComponent } from 'react';

import { useLocale } from '../contexts';

export interface TranslatedHtmlProps {
    id: string;
    data?: TranslationData;
}

const TranslatedHtml: FunctionComponent<TranslatedHtmlProps> = ({ data, id }) => {
    const { language } = useLocale();

    return (
        <span
            dangerouslySetInnerHTML={{
                // eslint-disable-next-line @typescript-eslint/naming-convention
                __html: DOMPurify.sanitize(language.translate(id, data), { ADD_ATTR: ['target'] }),
            }}
        />
    );
};

export default TranslatedHtml;
