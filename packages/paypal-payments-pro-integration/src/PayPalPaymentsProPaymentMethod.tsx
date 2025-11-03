import { type CheckoutService } from '@bigcommerce/checkout-sdk';
import { createPayPalProPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/paypal-pro';
import React, { type FunctionComponent, useCallback } from 'react';

import { HostedCreditCardComponent } from '@bigcommerce/checkout/hosted-credit-card-integration';
import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const PayPalPaymentsProPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    checkoutState,
    paymentForm,
    language,
    onUnhandledError,
}) => {
    const initializePayment: CheckoutService['initializePayment'] = useCallback(
        (options) => {
            return checkoutService.initializePayment({
                ...options,
                gatewayId: method.gateway,
                methodId: method.id,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                integrations: [...(options.integrations ?? []), createPayPalProPaymentStrategy],
            });
        },
        [checkoutService, method],
    );

    if (method.type === 'PAYMENT_TYPE_HOSTED') {
        return (
            <HostedPaymentComponent
                checkoutService={checkoutService}
                checkoutState={checkoutState}
                deinitializePayment={checkoutService.deinitializePayment}
                initializePayment={initializePayment}
                language={language}
                method={method}
                onUnhandledError={onUnhandledError}
                paymentForm={paymentForm}
            />
        );
    }

    return (
        <HostedCreditCardComponent
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            initializePayment={initializePayment}
            language={language}
            method={method}
            onUnhandledError={onUnhandledError}
            paymentForm={paymentForm}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PayPalPaymentsProPaymentMethod,
    [{ id: 'paypal' }],
);
