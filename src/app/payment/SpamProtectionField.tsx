import React, { Component } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';
import { TranslatedString } from '../locale';
import { LoadingOverlay } from '../ui/loading';

export interface SpamProtectionProps {
    onUnhandledError?(error: Error): void;
}

interface WithCheckoutSpamProtectionProps {
    isExecutingSpamCheck: boolean;
    verify(): void;
}

function mapToSpamProtectionProps(
    { checkoutService, checkoutState }: CheckoutContextProps
): WithCheckoutSpamProtectionProps {
    return {
        isExecutingSpamCheck: checkoutState.statuses.isExecutingSpamCheck(),
        verify: checkoutService.executeSpamCheck,
    };
}

class SpamProtectionField extends Component<SpamProtectionProps & WithCheckoutSpamProtectionProps> {
    render() {
        const {
            isExecutingSpamCheck,
            verify,
        } = this.props;

        return (
            <div className="spamProtection-container">
                <LoadingOverlay isLoading={ isExecutingSpamCheck }>
                    <div className="spamProtection-panel optimizedCheckout-overlay">
                        <a
                            className="spamProtection-panel-message optimizedCheckout-primaryContent"
                            data-test="customer-continue-button"
                            onClick={ verify }
                        >
                            <TranslatedString
                                id="spam_protection.verify_action"
                            />
                        </a>
                    </div>
                </LoadingOverlay>
            </div>
        );
    }
}

export default withCheckout(mapToSpamProtectionProps)(SpamProtectionField);
