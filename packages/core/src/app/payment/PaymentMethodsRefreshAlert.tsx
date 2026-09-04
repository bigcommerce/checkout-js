import React, { type FunctionComponent, useEffect, useRef } from 'react';

import { useLocale } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Alert, AlertType, IconClose } from '@bigcommerce/checkout/ui';

import './PaymentMethodsRefreshAlert.scss';

export interface PaymentMethodsRefreshAlertData {
    countryName: string;
    removedMethodName?: string;
}

export interface PaymentMethodsRefreshAlertProps {
    alert: PaymentMethodsRefreshAlertData;
    onDismiss(): void;
}

const AUTO_DISMISS_TIMEOUT = 5000;

export const PaymentMethodsRefreshAlert: FunctionComponent<PaymentMethodsRefreshAlertProps> = ({
    alert: { countryName, removedMethodName },
    onDismiss,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const onDismissRef = useRef(onDismiss);

    onDismissRef.current = onDismiss;

    useEffect(() => {
        const container = containerRef.current;

        try {
            container?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch {
            container?.scrollIntoView();
        }

        if (removedMethodName) {
            container?.focus({ preventScroll: true });

            return;
        }

        const timeoutId = window.setTimeout(() => onDismissRef.current(), AUTO_DISMISS_TIMEOUT);

        return () => window.clearTimeout(timeoutId);
    }, [countryName, removedMethodName]);

    const { language } = useLocale();

    return (
        <div
            className="paymentMethodsRefreshAlert"
            data-test="payment-methods-refresh-alert"
            ref={containerRef}
            tabIndex={-1}
        >
            <Alert type={AlertType.Info}>
                {removedMethodName ? (
                    <TranslatedString
                        data={{ countryName, methodName: removedMethodName }}
                        id="payment.payment_methods_reloaded_method_unavailable_text"
                    />
                ) : (
                    <TranslatedString
                        data={{ countryName }}
                        id="payment.payment_methods_updated_for_country_text"
                    />
                )}

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
