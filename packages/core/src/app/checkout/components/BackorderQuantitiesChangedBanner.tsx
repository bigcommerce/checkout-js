import React, { type FunctionComponent, useState } from 'react';
import { Alert, AlertType, IconClose } from '@bigcommerce/checkout/ui';

import './BackorderQuantitiesChangedBanner.scss';

export const BackorderQuantitiesChangedBanner: FunctionComponent<{ message?: string }> = ({ message }) => {
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed || !message) {
        return null;
    }

    return (
        <div className="checkout-backorder-quantities-banner" data-test="backorder-quantities-changed-banner">
            <Alert
                additionalClassName="checkout-backorder-quantities-banner--alert"
                type={AlertType.Info}
            >
                <div>{message}</div>
            </Alert>
            <button
                aria-label="Close"
                className="checkout-backorder-quantities-banner--close"
                data-test="backorder-quantities-changed-banner-close"
                onClick={() => setIsDismissed(true)}
                type="button"
            >
                <IconClose />
            </button>
        </div>
    );
};

export default BackorderQuantitiesChangedBanner;
