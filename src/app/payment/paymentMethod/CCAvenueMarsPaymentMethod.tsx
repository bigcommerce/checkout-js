import React, { FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { TranslatedString } from '../../locale';

import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';

export type CCAvenueMarsPaymentMethodProps = Omit<HostedPaymentMethodProps, 'description'>;

const CCAvenueMarsPaymentMethod: FunctionComponent<CCAvenueMarsPaymentMethodProps> = props => (
    <HostedPaymentMethod
        { ...props }
        description={ <TranslatedString id="payment.ccavenuemars_description_text" /> }
    />
);

export default CCAvenueMarsPaymentMethod;
