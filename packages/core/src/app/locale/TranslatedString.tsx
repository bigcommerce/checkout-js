import React, { FunctionComponent } from 'react';

import withLanguage, { WithLanguageProps } from './withLanguage';

export interface TranslatedStringProps {
    id: string;
    data?: any;
}

const TranslatedString: FunctionComponent<TranslatedStringProps & WithLanguageProps> = ({
    data,
    id,
    language,
}) => <>{language.translate(id, data)}</>;

export default withLanguage(TranslatedString);
