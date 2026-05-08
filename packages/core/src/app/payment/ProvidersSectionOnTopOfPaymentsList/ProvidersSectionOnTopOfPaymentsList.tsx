import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import React from 'react';
import { getUniquePaymentMethodId } from '../paymentMethod';

export interface ProvidersSectionOnTopOfPaymentsListProps {
    methods: PaymentMethod[];
}

export const ProvidersSectionOnTopOfPaymentsList = ({ methods }: ProvidersSectionOnTopOfPaymentsListProps) => {
    const methodsWithTopSection = methods.filter((method) => method.initializationData?.hasSectionOnTopOfPaymentsList);

    if (!methodsWithTopSection.length) {
        return null;
    }

    return (
        <div className="providers-section-on-top-of-payments-list" data-test="providers-section-on-top-of-payments-list">
            {methodsWithTopSection.map((method) => {
                const prefix = getUniquePaymentMethodId(method.id, method.gateway);
                const containerId = `${prefix}-provider-section-on-top-of-payments-list`;

                return (
                    <div data-test={containerId} id={containerId} key={prefix} />
                );
            })}
        </div>
    );
};
