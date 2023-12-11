import { CustomerInitializeOptions, CustomerRequestOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { PureComponent } from 'react';

const WALLET_BUTTON_HEIGHT = 36;

export interface CheckoutButtonProps {
    containerId: string;
    methodId: string;
    isShowingWalletButtonsOnTop?: boolean;
    deinitialize(options: CustomerRequestOptions): void;
    initialize(options: CustomerInitializeOptions): void;
    onError?(error: Error): void;
    onClick?(methodId: string): void;
}

export default class CheckoutButton extends PureComponent<CheckoutButtonProps> {
    componentDidMount() {
        const {
            containerId,
            initialize,
            isShowingWalletButtonsOnTop,
            methodId,
            onError,
            onClick = noop,
        } = this.props;

        const heightOption = isShowingWalletButtonsOnTop && (methodId === 'braintreepaypal' || methodId === 'braintreepaypalcredit' )
            ? { buttonHeight: WALLET_BUTTON_HEIGHT }
            : {};

        initialize({
            methodId,
            [methodId]: {
                ...heightOption,
                container: containerId,
                onError,
                onClick: () => onClick(methodId),
            },
        });
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
