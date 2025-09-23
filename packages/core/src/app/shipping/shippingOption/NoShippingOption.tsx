import React, { type ReactElement } from 'react';

import { ChecklistSkeleton } from '@bigcommerce/checkout/ui';

interface NoShippingOptionsProps {
    message: React.ReactNode;
    isLoading: boolean;
}

export const NoShippingOptions = ({ message, isLoading }: NoShippingOptionsProps): ReactElement => (
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
