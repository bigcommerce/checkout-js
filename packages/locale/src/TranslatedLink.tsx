import React, { FunctionComponent, MouseEventHandler } from 'react';

import { TranslatedStringProps } from './TranslatedString';
import { parseAnchor, preventDefault } from './utils';
import withLanguage, { WithLanguageProps } from './withLanguage';

export type TranslatedLinkProps = TranslatedStringProps & {
    testId?: string;
    onClick: MouseEventHandler;
};

const TranslatedLink: FunctionComponent<TranslatedLinkProps & WithLanguageProps> = ({
    data,
    id,
    language,
    onClick,
    testId,
}) => {
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

export default withLanguage(TranslatedLink);
