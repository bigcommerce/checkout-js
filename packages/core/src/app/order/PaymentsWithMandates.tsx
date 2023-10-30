import React, { FunctionComponent } from 'react';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { MandateTextComponent } from './MandateTextComponent';
import { GatewayOrderPayment } from '@bigcommerce/checkout-sdk';

export interface PaymentsWithMandatesProps {
    paymentsWithMandates: GatewayOrderPayment[];
}

export const PaymentsWithMandates: FunctionComponent<PaymentsWithMandatesProps> = ({
    paymentsWithMandates,
}) => <>
    {paymentsWithMandates.map((payment) => {
        if (payment?.mandate?.url) {
            return (
                <a
                    data-test="order-confirmation-mandate-link-text"
                    href={payment.mandate.url}
                    key={`${payment.providerId}-${payment.methodId}-mandate`}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <TranslatedString
                        id={`order_confirmation.mandate.${payment.providerId}.${payment.methodId}`}
                    />
                </a>
            );
        } else if (payment?.mandate?.id) {
            return (
                <p
                    data-test="order-confirmation-mandate-id-text"
                    key={`${payment.providerId}-${payment.methodId}-mandate`}
                >
                    <TranslatedString
                        data={{ mandate: payment.mandate.id }}
                        id={`order_confirmation.mandate.${payment.providerId}.${payment.methodId}`}
                    />
                </p>
            );
        } else if (payment?.mandate?.mandateText && payment.methodId) {
            return <MandateTextComponent
                key='mandateTextList'
                mandateText={payment.mandate.mandateText}
                methodId={payment.methodId}
                providerId={payment.providerId}
            />
        }
    })}
</>
