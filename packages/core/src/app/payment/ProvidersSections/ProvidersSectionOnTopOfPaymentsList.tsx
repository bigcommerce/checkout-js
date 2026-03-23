import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import React from 'react';

export interface ProvidersSectionOnTopOfPaymentsListProps {
    methods: PaymentMethod[];
}

export interface ProviderSectionProps {
    method: PaymentMethod;
}

const ProviderSection = ({ method }: ProviderSectionProps) => {
    const { gateway, id, initializationData } = method;

    if (!initializationData?.hasSectionOnTopOfPaymentsList) {
        return null;
    }

    const providerIdPrefix = gateway ? `${gateway}-${id}` : `${id}`;
    const containerId = `${providerIdPrefix}-provider-section-on-top-of-payments-list`;

    return (
        <div id={containerId} />
    );
}

export const ProvidersSectionOnTopOfPaymentsList = ({ methods }: ProvidersSectionOnTopOfPaymentsListProps) => {
    return (
        <div className="providers-section-on-top-of-payments-list">
            {methods.map((method) => (
                <ProviderSection key={method.id} method={method} />
            ))}
        </div>
    );
};
