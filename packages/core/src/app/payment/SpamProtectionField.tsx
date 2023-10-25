import { CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, MouseEvent, ReactNode } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../checkout';
import { isErrorWithType } from '../common/error';
import { LoadingOverlay } from '../ui/loading';

export interface SpamProtectionProps {
    didExceedSpamLimit?: boolean;
    onUnhandledError?(error: Error): void;
}

interface SpamProtectionState {
    shouldShowRetryButton: boolean;
}

interface WithCheckoutSpamProtectionProps {
    isExecutingSpamCheck: boolean;
    executeSpamCheck(): Promise<CheckoutSelectors>;
}

function mapToSpamProtectionProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutSpamProtectionProps {
    return {
        isExecutingSpamCheck: checkoutState.statuses.isExecutingSpamCheck(),
        executeSpamCheck: checkoutService.executeSpamCheck,
    };
}

class SpamProtectionField extends Component<
    SpamProtectionProps & WithCheckoutSpamProtectionProps,
    SpamProtectionState
> {
    state = {
        shouldShowRetryButton: false,
    };

    async componentDidMount() {
        const { didExceedSpamLimit } = this.props;

        if (didExceedSpamLimit) {
            return;
        }

        this.verify();
    }

    render() {
        const { isExecutingSpamCheck } = this.props;

        return (
            <div className="spamProtection-container">
                <LoadingOverlay isLoading={isExecutingSpamCheck}>
                    {this.renderContent()}
                </LoadingOverlay>
            </div>
        );
    }

    private renderContent(): ReactNode {
        const { didExceedSpamLimit } = this.props;
        const { shouldShowRetryButton } = this.state;

        if (!didExceedSpamLimit && !shouldShowRetryButton) {
            return;
        }

        return (
            <div className="spamProtection-panel optimizedCheckout-overlay">
                <a
                    className="spamProtection-panel-message optimizedCheckout-primaryContent"
                    data-test="spam-protection-verify-button"
                    onClick={this.handleRetry}
                >
                    <TranslatedString id="spam_protection.verify_action" />
                </a>
            </div>
        );
    }

    private async verify(): Promise<void> {
        const { executeSpamCheck, onUnhandledError = noop } = this.props;

        try {
            await executeSpamCheck();
        } catch (error) {
            this.setState({ shouldShowRetryButton: true });

            // Notify the parent component if the user experiences a problem other than cancelling the reCaptcha challenge.
            if (
                isErrorWithType(error) &&
                error.type !== 'spam_protection_challenge_not_completed'
            ) {
                onUnhandledError(error);
            }
        }
    }

    private handleRetry: (event: MouseEvent) => void = (event) => {
        event.preventDefault();

        this.verify();
    };
}

export default withCheckout(mapToSpamProtectionProps)(SpamProtectionField);
