import { SpamProtectionOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';

export interface SpamProtectionProps {
    containerId: string;
    onUnhandledError?(error: Error): void;
}

interface WithCheckoutSpamProtectionProps {
    initialize(options: SpamProtectionOptions): void;
}

function mapToSpamProtectionProps(
    { checkoutService }: CheckoutContextProps
): WithCheckoutSpamProtectionProps {
    return {
        initialize: checkoutService.initializeSpamProtection,
    };
}

class SpamProtectionField extends Component<SpamProtectionProps & WithCheckoutSpamProtectionProps> {
    async componentDidMount() {
        const {
            containerId,
            initialize,
            onUnhandledError = noop,
        } = this.props;

        try {
            await initialize({ containerId });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    render() {
        const { containerId } = this.props;

        return <div id={ containerId }></div>;
    }
}

export default withCheckout(mapToSpamProtectionProps)(SpamProtectionField);
