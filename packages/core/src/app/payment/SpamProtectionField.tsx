import React, { type MouseEvent, useEffect, useState } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { isErrorWithType } from '../common/error';

interface SpamProtectionFieldProps {
    didExceedSpamLimit?: boolean;
    onUnhandledError?(error: Error): void;
}

const SpamProtectionField = ({
    didExceedSpamLimit,
    onUnhandledError
}: SpamProtectionFieldProps): JSX.Element => {
    const [shouldShowRetryButton, setShouldShowRetryButton] = useState(false);

    const {
        checkoutService: { executeSpamCheck },
        checkoutState: { statuses }
    } = useCheckout();

    const isExecutingSpamCheck = statuses.isExecutingSpamCheck();

    const verify: () => void = async () => {
        try {
            await executeSpamCheck();
        } catch (error) {
            setShouldShowRetryButton(true);

            // Notify the parent component if the user experiences a problem other than cancelling the reCaptcha challenge.
            if (isErrorWithType(error) && error.type !== 'spam_protection_challenge_not_completed' && onUnhandledError) {
                onUnhandledError(error);
            }
        }
    };

    useEffect(() => {
        if (didExceedSpamLimit) {
            return;
        }

        verify();
    }, []);

    const handleRetry = (event: MouseEvent) => {
        event.preventDefault();

        verify();
    };

    return (
        <div className="spamProtection-container">
            <LoadingOverlay isLoading={isExecutingSpamCheck}>
                {(didExceedSpamLimit || shouldShowRetryButton) && (
                    <div className="spamProtection-panel optimizedCheckout-overlay">
                        <a
                            className="spamProtection-panel-message optimizedCheckout-primaryContent"
                            data-test="spam-protection-verify-button"
                            onClick={handleRetry}
                        >
                            <TranslatedString id="spam_protection.verify_action" />
                        </a>
                    </div>
                )}
            </LoadingOverlay >
        </div >
    );
};

export default SpamProtectionField;
