import React from 'react';

import { ChecklistSkeleton } from '@bigcommerce/checkout/ui';

export const NoShippingOptions: React.FC<{ message: React.ReactNode, isLoading: boolean }> = ({ message, isLoading }) => (
    <ChecklistSkeleton
        additionalClassName="shippingOptions-skeleton"
        isLoading={isLoading}
        rows={2}
    >
        <div className="shippingOptions-panel optimizedCheckout-overlay">
            <p
                aria-live="polite"
                className="shippingOptions-panel-message optimizedCheckout-primaryContent"
                role="alert"
            >
                {message}
            </p>
        </div>
    </ChecklistSkeleton>
);
