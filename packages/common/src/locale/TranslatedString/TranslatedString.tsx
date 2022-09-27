import { TranslationData } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';

export interface TranslatedStringProps extends Pick<PaymentMethodProps, 'language'> {
    id: string;
    data?: TranslationData;
}

const TranslatedString: FunctionComponent<TranslatedStringProps> = ({ data, id, language }) => (
    <>{language.translate(id, data)}</>
);

export default TranslatedString;
