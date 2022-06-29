import React, { Fragment, FunctionComponent } from 'react';

import withLanguage, { WithLanguageProps } from './withLanguage';

export interface TranslatedStringProps {
    id: string;
    data?: any;
}

const TranslatedString: FunctionComponent<TranslatedStringProps & WithLanguageProps> = ({
    data,
    id,
    language,
}) => (
    <Fragment>
        { language.translate(id, data) }
    </Fragment>
);

export default withLanguage(TranslatedString);
