import React, { FunctionComponent } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const BlueSnapDirectAlternativePaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    ...rest
}) => {
    return (
        <HostedPaymentComponent
            {...rest}
            checkoutService={checkoutService}
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={checkoutService.initializePayment}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BlueSnapDirectAlternativePaymentMethod,
    [{ gateway: 'bluesnapdirect' }],
);
