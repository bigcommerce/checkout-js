import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createAfterpayPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/afterpay';
import { createClearpayPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/clearpay';
import { createSezzlePaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/sezzle';
import { createZipPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/zip';
import React, { type FunctionComponent } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import { HostedPaymentComponent } from './components';

const HostedPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    method,
    onUnhandledError,
    language,
    paymentForm,
}) => {
    const initializeHostedPaymentMethod = async (options: PaymentInitializeOptions) => {
        return checkoutService.initializePayment({
            ...options,
            integrations: [
                createZipPaymentStrategy,
                createAfterpayPaymentStrategy,
                createSezzlePaymentStrategy,
                createClearpayPaymentStrategy,
            ],
        });
    };

    return (
        <HostedPaymentComponent
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={initializeHostedPaymentMethod}
            language={language}
            method={method}
            onUnhandledError={onUnhandledError}
            paymentForm={paymentForm}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    HostedPaymentMethod,
    [
        { gateway: 'afterpay' },
        { id: 'afterpay' },
        { gateway: 'clearpay' },
        { id: 'clearpay' },
        { id: 'quadpay' },
        { id: 'sezzle' },
        { id: 'zip' },
    ],
);
