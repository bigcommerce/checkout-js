import React, { type FunctionComponent } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import { HostedCreditCardComponent } from './components';

const HostedCreditCardPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    checkoutState,
    paymentForm,
    language,
    onUnhandledError,
}) => {
    return (
        <HostedCreditCardComponent
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            language={language}
            method={method}
            onUnhandledError={onUnhandledError}
            paymentForm={paymentForm}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    HostedCreditCardPaymentMethod,
    // experiment should be write with underscore because point after build will set this value like variable
    [
        {
            id: 'hosted-credit-card',
        },
        { id: 'credit_card', gateway: 'bluesnapdirect' },
        { id: 'credit_card', gateway: 'checkoutcom' },

        { id: 'tdonlinemart' },
        { id: 'cba_mpgs', experiment: 'PI-4748_cba_resolver_configuration' },
        {
            id: 'sagepay',
            experiment: 'PI-4754_sage_pay_resolver_configuration',
        },
    ],
);
