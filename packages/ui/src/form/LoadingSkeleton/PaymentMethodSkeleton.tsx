import React, { type FunctionComponent } from 'react';

import ChecklistSkeleton from './ChecklistSkeleton';

export const PaymentMethodSkeleton: FunctionComponent = () => (
    <div aria-busy="true" data-test="payment-method-skeleton" role="status">
        <ChecklistSkeleton additionalClassName="payment-method-skeleton" rows={2} />
    </div>
);
