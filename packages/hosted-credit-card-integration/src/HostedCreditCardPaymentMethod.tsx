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
        { id: 'cba_mpgs' },
        { id: 'sagepay' },
        { id: 'clover', experiment: 'PI-4747_clover_resolver_configuration' },
        { id: 'hps', experiment: 'PI-4751_hps_resolver_configuration' },
        { id: 'cybersource' },
        { id: 'cybersourcev2' },
        { id: 'bnz' },
        { id: 'ewayrapid', experiment: 'PI-4750_ewayrapid_resolver_configuration' },

        {
            id: 'authorizenet',
            experiment: 'PI-4745_authorizenet_resolver_configuration',
        },
    ],
);
