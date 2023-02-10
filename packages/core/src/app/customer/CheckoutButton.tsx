import { CustomerInitializeOptions, CustomerRequestOptions } from '@bigcommerce/checkout-sdk';
import React, { PureComponent } from 'react';

import { CheckoutContextProps, withCheckout } from '../checkout';

export interface CheckoutButtonProps {
    containerId: string;
    methodId: string;
    outstandingBalance?: number;
    deinitialize(options: CustomerRequestOptions): void;
    initialize(options: CustomerInitializeOptions): void;
    onError?(error: Error): void;
}

class CheckoutButton extends PureComponent<CheckoutButtonProps> {
    componentDidMount() {
        const { containerId, initialize, methodId, onError } = this.props;

        initialize({
            methodId,
            [methodId]: {
                container: containerId,
                onError,
            },
        });
    }

    componentDidUpdate(prevProps: CheckoutButtonProps) {
        const { outstandingBalance, containerId, deinitialize, initialize, methodId, onError } = this.props;

        if (prevProps.outstandingBalance !== outstandingBalance) {
            deinitialize({ methodId });
            initialize({
                methodId,
                [methodId]: {
                    container: containerId,
                    onError,
                },
            });
        }
      }

    componentWillUnmount() {
        const { deinitialize, methodId } = this.props;

        deinitialize({ methodId });
    }

    render() {
        const { containerId } = this.props;

        return <div id={containerId} />;
    }
}

export default withCheckout(({
    checkoutState,
}: CheckoutContextProps) => {
    const { data: { getCheckout } } = checkoutState;
    const { outstandingBalance } = getCheckout() || {};

    return { outstandingBalance };
})(CheckoutButton);
