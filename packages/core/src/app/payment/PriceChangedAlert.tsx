import React, { type FunctionComponent, useEffect, useRef } from 'react';

import { useLocale } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Alert, AlertType, IconClose } from '@bigcommerce/checkout/ui';

import './PaymentMethodsRefreshAlert.scss';

export interface PriceChangedAlertProps {
    onDismiss(): void;
}

// Shown when Place Order was stopped because the total changed. Not auto-dismissed.
export const PriceChangedAlert: FunctionComponent<PriceChangedAlertProps> = ({ onDismiss }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { language } = useLocale();

    useEffect(() => {
        const container = containerRef.current;

        try {
            container?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch {
            container?.scrollIntoView();
        }

        container?.focus({ preventScroll: true });
    }, []);

    return (
        <div
            className="priceChangedAlert"
            data-test="price-changed-alert"
            ref={containerRef}
            tabIndex={-1}
        >
            <Alert type={AlertType.Warning}>
                <TranslatedString id="payment.price_changed_text" />

                <button
                    aria-label={language.translate('common.close_action')}
                    className="paymentMethodsRefreshAlert-closeButton"
                    onClick={onDismiss}
                    type="button"
                >
                    <IconClose />
                </button>
            </Alert>
        </div>
    );
};
