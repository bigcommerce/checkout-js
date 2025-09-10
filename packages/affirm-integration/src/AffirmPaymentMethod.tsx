import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createAffirmPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/affirm';
import React, { type FunctionComponent, useCallback, useMemo } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const AffirmPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    ...rest
}) => {
    const description = useMemo(() => <TranslatedString id="payment.affirm_body_text" />, []);

    const initializeAffirmPayment = useCallback(
        (options: PaymentInitializeOptions) => {
            return checkoutService.initializePayment({
                ...options,
                integrations: [createAffirmPaymentStrategy],
            });
        },
        [checkoutService],
    );

    return (
        <HostedPaymentComponent
            {...rest}
            checkoutService={checkoutService}
            deinitializePayment={checkoutService.deinitializePayment}
            description={description}
            initializePayment={initializeAffirmPayment}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    AffirmPaymentMethod,
    [{ id: 'affirm' }],
);
