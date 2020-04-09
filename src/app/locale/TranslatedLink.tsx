import React, { Fragment, FunctionComponent } from 'react';

import { preventDefault } from '../common/dom';
import { parseAnchor } from '../common/utility';

import withLanguage, { WithLanguageProps } from './withLanguage';
import { TranslatedStringProps } from './TranslatedString';

export type TranslatedLinkProps = TranslatedStringProps & {
    testId?: string;
    onClick(): void;
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

    return <Fragment>
        { parsedString[0] }
        <a
            data-test={ testId }
            href="#"
            onClick={ preventDefault(onClick) }
        >
            { parsedString[1] }
        </a>
        { parsedString[2] }
    </Fragment>;
};

export default withLanguage(TranslatedLink);
