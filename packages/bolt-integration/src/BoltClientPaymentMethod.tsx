import { CheckoutService, PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createBoltPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations';
import React, { FunctionComponent, useCallback } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import { PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';

const BoltClientPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    method,
    ...rest
}) => {
    const initializeBoltPayment: CheckoutService['initializePayment'] = useCallback(
        (options: PaymentInitializeOptions) =>
            checkoutService.initializePayment({
                ...options,
                integrations: [createBoltPaymentStrategy],
                bolt: {
                    useBigCommerceCheckout: true,
                },
            }),
        [checkoutService],
    );

    return (
        <HostedPaymentComponent
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={initializeBoltPayment}
            method={method}
            {...rest}
        />
    );
};

export default BoltClientPaymentMethod;
