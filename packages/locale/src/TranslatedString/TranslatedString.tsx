import { TranslationData } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { useLocale } from '../context';

export interface TranslatedStringProps {
    id: string;
    data?: TranslationData;
}

const TranslatedString: FunctionComponent<TranslatedStringProps> = ({ data, id }) => {
    const { language } = useLocale();

    return <>{language.translate(id, data)}</>;
};

export default TranslatedString;
