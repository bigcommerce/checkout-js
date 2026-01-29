import React, { type FunctionComponent, useState } from 'react';

import { Alert, AlertType } from '@bigcommerce/checkout/ui';

import OrderConfirmationSection from '../OrderConfirmationSection';

interface ExpiredTokenViewProps {
    orderId: number;
    onResendClick: () => Promise<void>;
}

export const ExpiredTokenView: FunctionComponent<ExpiredTokenViewProps> = ({
    orderId: _orderId,
    onResendClick,
}) => {
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendError, setResendError] = useState<string | undefined>();

    const handleResendClick = async () => {
        setIsResending(true);
        setResendError(undefined);

        try {
            await onResendClick();
            setResendSuccess(true);
        } catch (error) {
            setResendError(
                error instanceof Error
                    ? error.message
                    : 'Failed to resend link. Please try again later.',
            );
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="layout optimizedCheckout-contentPrimary">
            <div className="layout-main">
                <div className="orderConfirmation">
                    <OrderConfirmationSection>
                        <div className="orderConfirmation-expiredToken">
                            <h2>Link Expired</h2>
                            <p>For security, this link has expired.</p>

                            {!resendSuccess && !resendError && (
                                <button
                                    className="button button--primary"
                                    disabled={isResending}
                                    onClick={handleResendClick}
                                    type="button"
                                >
                                    {isResending ? 'Sending...' : 'Resend Secure Link'}
                                </button>
                            )}

                            {resendSuccess && (
                                <Alert type={AlertType.Success}>
                                    A new link has been sent to your email address.
                                </Alert>
                            )}

                            {resendError && <Alert type={AlertType.Error}>{resendError}</Alert>}
                        </div>
                    </OrderConfirmationSection>
                </div>
            </div>
        </div>
    );
};

export default ExpiredTokenView;
