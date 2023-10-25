import React, { PureComponent, ReactNode } from 'react';

import { TranslatedHtml } from '@bigcommerce/checkout/locale';

import { LoadingOverlay } from '../ui/loading';

export interface EmptyCartMessageProps {
    waitInterval?: number;
    loginUrl: string;
}

interface EmptyCartMessageState {
    isWaiting: boolean;
}

export default class EmptyCartMessage extends PureComponent<
    EmptyCartMessageProps,
    EmptyCartMessageState
> {
    state: EmptyCartMessageState = {
        isWaiting: true,
    };

    private waitToken?: number;

    componentDidMount(): void {
        const { waitInterval } = this.props;

        this.waitToken = setTimeout(() => {
            this.setState({ isWaiting: false });
        }, waitInterval);
    }

    componentWillUnmount(): void {
        clearInterval(this.waitToken);
    }

    render(): ReactNode {
        const { loginUrl } = this.props;
        const { isWaiting } = this.state;

        return (
            <LoadingOverlay hideContentWhenLoading isLoading={isWaiting}>
                <TranslatedHtml data={{ url: loginUrl }} id="cart.empty_cart_message" />
            </LoadingOverlay>
        );
    }
}
