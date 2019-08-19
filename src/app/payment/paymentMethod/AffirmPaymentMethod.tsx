import React, { FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { TranslatedString } from '../../locale';

import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';

export type AffirmPaymentMethodProps = Omit<HostedPaymentMethodProps, 'description'>;

const AffirmPaymentMethod: FunctionComponent<AffirmPaymentMethodProps> = props => (
    <HostedPaymentMethod
        { ...props }
        description={ <TranslatedString id="payment.affirm_body_text" /> }
    />
);

export default AffirmPaymentMethod;
