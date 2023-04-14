import { TranslationData } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

// import { useLocale } from '../contexts';

export interface TranslatedStringProps {
    id: string;
    data?: TranslationData;
}

const TranslatedString: FunctionComponent<TranslatedStringProps> = ({ data, id }) => {
    // TODO:: issue with useLocal() will be resolve in next week
    // const { language } = useLocale();
    const language = {
        translate: (tranId: string, tranData?: TranslationData) => {
            if (tranData && tranData[tranId]) {
                return tranData[tranId];
            }

            return 'TranslatedString';
        },
    };

    return <>{language.translate(id, data)}</>;
};

export default TranslatedString;
