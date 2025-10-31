import React, { type FunctionComponent } from 'react';

import { useLocale } from '@bigcommerce/checkout/contexts';

export interface TranslatedStringProps {
    id: string;
    data?: any;
}

const TranslatedString: FunctionComponent<TranslatedStringProps> = ({ data, id }) => {
    const { language } = useLocale();

    return <>{language.translate(id, data)}</>;
};

export default TranslatedString;
