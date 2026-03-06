import React, { type FunctionComponent, useState } from 'react';

import { useLocale } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Alert, AlertType, Button, ButtonVariant } from '@bigcommerce/checkout/ui';

import OrderConfirmationSection from '../OrderConfirmationSection';

interface ExpiredPermalinkViewProps {
    onResendClick: () => Promise<void>;
}

export const ExpiredPermalinkView: FunctionComponent<ExpiredPermalinkViewProps> = ({
    onResendClick,
}) => {
    const { language } = useLocale();
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendError, setResendError] = useState<string | undefined>();

    const handleResendClick = async () => {
        setIsResending(true);
        setResendError(undefined);
        setResendSuccess(false);

        try {
            await onResendClick();
            setResendSuccess(true);
        } catch {
            setResendError(language.translate('order_confirmation.expired_token.resend_error'));
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
                            <h2><TranslatedString id="order_confirmation.expired_token.heading" /></h2>
                            <p><TranslatedString id="order_confirmation.expired_token.description" /></p>

                            {!resendSuccess && (
                                <Button
                                    isLoading={isResending}
                                    onClick={handleResendClick}
                                    variant={ButtonVariant.Primary}
                                >
                                    {isResending
                                        ? language.translate('order_confirmation.expired_token.sending')
                                        : language.translate('order_confirmation.expired_token.resend_action')}
                                </Button>
                            )}

                            {resendSuccess && (
                                <Alert type={AlertType.Success}>
                                    <TranslatedString id="order_confirmation.expired_token.resend_success" />
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

export default ExpiredPermalinkView;
