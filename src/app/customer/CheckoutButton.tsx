import { CustomerInitializeOptions, CustomerRequestOptions } from '@bigcommerce/checkout-sdk';
import React, { PureComponent } from 'react';

export interface CheckoutButtonProps {
    containerId: string;
    methodId: string;
    deinitialize(options: CustomerRequestOptions): void;
    initialize(options: CustomerInitializeOptions): void;
    onError?(error: Error): void;
}

export default class CheckoutButton extends PureComponent<CheckoutButtonProps> {
    componentDidMount() {
        const {
            containerId,
            initialize,
            methodId,
            onError,
        } = this.props;

        initialize({
            methodId,
            [methodId]: {
                container: containerId,
                onError,
            },
        });
    }

    componentWillUnmount() {
        const {
            deinitialize,
            methodId,
        } = this.props;

        deinitialize({ methodId });
    }

    render() {
        const { containerId } = this.props;

        return (
            <div id={ containerId } />
        );
    }
}
