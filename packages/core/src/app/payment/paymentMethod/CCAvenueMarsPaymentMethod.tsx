import { HostedPaymentMethodProps } from '@bigcommerce/checkout-js/payment-integration';
import React, { useMemo, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { TranslatedString } from '../../locale';

import HostedPaymentMethod from './HostedPaymentMethod';

export type CCAvenueMarsPaymentMethodProps = Omit<HostedPaymentMethodProps, 'description'>;

const CCAvenueMarsPaymentMethod: FunctionComponent<CCAvenueMarsPaymentMethodProps> = props => {
    const description = useMemo(() => <TranslatedString id="payment.ccavenuemars_description_text" />, []);

    return <HostedPaymentMethod
        { ...props }
        description={ description }
    />;
};

export default CCAvenueMarsPaymentMethod;
