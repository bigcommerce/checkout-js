import React, { FunctionComponent, MouseEventHandler } from 'react';

import { parseAnchor, preventDefault } from '@bigcommerce/checkout/dom-utils';

import { useLocale } from './LocaleContext';
import { TranslatedStringProps } from './TranslatedString';

export type TranslatedLinkProps = TranslatedStringProps & {
    testId?: string;
    onClick: MouseEventHandler;
};

const TranslatedLink: FunctionComponent<TranslatedLinkProps> = ({ data, id, onClick, testId }) => {
    const { language } = useLocale();
    const translatedString = language.translate(id, data);
    const parsedString = parseAnchor(translatedString);

    return parsedString.length ? (
        <>
            {parsedString[0]}
            <a data-test={testId} href="#" onClick={preventDefault(onClick)}>
                {parsedString[1]}
            </a>
            {parsedString[2]}
        </>
    ) : (
        <>{translatedString}</>
    );
};

export default TranslatedLink;
