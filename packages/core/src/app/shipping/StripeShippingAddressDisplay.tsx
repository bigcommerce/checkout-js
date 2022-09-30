import { CheckoutSelectors, ShippingInitializeOptions, ShippingRequestOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { PureComponent, ReactNode } from 'react';

export interface StripeupeShippingAddressProps {
    methodId?: string;
    deinitialize(options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
    initialize(options?: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: Error): void;
}

class StripeShippingAddressDisplay extends PureComponent<StripeupeShippingAddressProps> {
    async componentDidMount(): Promise<void> {
        const {
            initialize,
            methodId,
            onUnhandledError = noop,
        } = this.props;

        try {
            await initialize({ methodId });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    async componentWillUnmount(): Promise<void> {
        const {
            deinitialize,
            methodId,
            onUnhandledError = noop,
        } = this.props;

        try {
            await deinitialize({ methodId });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    render(): ReactNode {

        return (
            <>
                <div className="stepHeader" style={ { padding: 0 } }>
                    <div id="StripeUpeShipping" style={ { width: '100%' } } />
                </div>
                <br />
            </>
        );
    }
}

export default StripeShippingAddressDisplay;
