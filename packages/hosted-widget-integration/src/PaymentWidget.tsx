import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { type ReactElement } from 'react';

interface PaymentWidgetProps {
    additionalContainerClassName: string | undefined;
    containerId: string;
    hideContentWhenSignedOut: boolean;
    hideWidget: boolean;
    isSignInRequired: boolean | undefined;
    isSignedIn: boolean;
    method: PaymentMethod;
    renderCustomPaymentForm: (() => React.ReactNode) | undefined;
    shouldRenderCustomInstrument: boolean;
    shouldShowCreditCardFieldset: boolean;
}

export const PaymentWidget = ({
    additionalContainerClassName,
    containerId,
    hideContentWhenSignedOut,
    hideWidget,
    isSignInRequired,
    isSignedIn,
    method,
    renderCustomPaymentForm,
    shouldRenderCustomInstrument,
    shouldShowCreditCardFieldset,
}: PaymentWidgetProps): ReactElement => (
    <div
        className={classNames(
            'widget',
            `widget--${method.id}`,
            'payment-widget',
            shouldRenderCustomInstrument ? '' : additionalContainerClassName,
        )}
        id={containerId}
        style={{
            display:
                (hideContentWhenSignedOut && isSignInRequired && !isSignedIn) ||
                !shouldShowCreditCardFieldset ||
                hideWidget
                    ? 'none'
                    : undefined,
        }}
        tabIndex={-1}
    >
        {shouldRenderCustomInstrument && renderCustomPaymentForm && renderCustomPaymentForm()}
    </div>
);
