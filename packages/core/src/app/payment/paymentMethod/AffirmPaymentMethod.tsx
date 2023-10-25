import React, { FunctionComponent, useMemo } from 'react';
import { Omit } from 'utility-types';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';

export type AffirmPaymentMethodProps = Omit<HostedPaymentMethodProps, 'description'>;

const AffirmPaymentMethod: FunctionComponent<AffirmPaymentMethodProps> = (props) => {
    const description = useMemo(() => <TranslatedString id="payment.affirm_body_text" />, []);

    return <HostedPaymentMethod {...props} description={description} />;
};

export default AffirmPaymentMethod;
