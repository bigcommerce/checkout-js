import React, { FunctionComponent, useMemo } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const AfterpayPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    method,
    paymentForm,
    ...rest
}) => {
    const description = useMemo(() => <TranslatedString id="payment.affirm_body_text" />, []);

    return (
        <HostedPaymentComponent
            {...rest}
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            deinitializePayment={checkoutService.deinitializePayment}
            description={description}
            initializePayment={checkoutService.initializePayment}
            method={method}
            paymentForm={paymentForm}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    AfterpayPaymentMethod,
    [{ gateway: 'afterpay' }],
);
