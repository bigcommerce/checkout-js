import { CheckoutSelectors, ShippingInitializeOptions, ShippingRequestOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { SignOutLink } from '../payment';

export interface RemoteShippingAddressProps {
    containerId: string;
    methodId: string;
    deinitialize(options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
    initialize(options?: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onSignOut(): void;
    onUnhandledError?(error: Error): void;
}

class RemoteShippingAddress extends Component<RemoteShippingAddressProps> {
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
        const {
            containerId,
            methodId,
            onSignOut,
        } = this.props;

        return (
            <>
                <div
                    id={ containerId }
                    className={ `widget address-widget widget--${methodId}` }
                    tabIndex={ -1 }
                />

                <SignOutLink method={ { id: methodId } } onSignOut={ onSignOut } />
            </>
        );
    }
}

export default RemoteShippingAddress;
