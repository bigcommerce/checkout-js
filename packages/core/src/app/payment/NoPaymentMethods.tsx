import React, { type ReactElement } from 'react';

import { ChecklistSkeleton } from '@bigcommerce/checkout/ui';

interface NoPaymentMethodsProps {
    message: React.ReactNode;
}

export const NoPaymentMethods = ({ message }: NoPaymentMethodsProps): ReactElement => (
    <ChecklistSkeleton
        additionalClassName="noPaymentMethods-skeleton"
        isLoading={false}
        rows={2}
    >
        <div className="noPaymentMethods-panel optimizedCheckout-overlay">
            <p
                aria-live="polite"
                className="noPaymentMethods-panel-message optimizedCheckout-primaryContent"
                role="alert"
            >
                {message}
            </p>
        </div>
    </ChecklistSkeleton>
);
