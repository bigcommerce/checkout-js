import React, { FunctionComponent, useMemo } from 'react';
import { Omit } from 'utility-types';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';

export type CCAvenueMarsPaymentMethodProps = Omit<HostedPaymentMethodProps, 'description'>;

const CCAvenueMarsPaymentMethod: FunctionComponent<CCAvenueMarsPaymentMethodProps> = (props) => {
    const description = useMemo(
        () => <TranslatedString id="payment.ccavenuemars_description_text" />,
        [],
    );

    return <HostedPaymentMethod {...props} description={description} />;
};

export default CCAvenueMarsPaymentMethod;
