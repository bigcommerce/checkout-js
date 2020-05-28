import { Address, CheckoutSelectors, ShippingInitializeOptions, ShippingRequestOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { PureComponent, ReactNode } from 'react';

import { StaticAddress } from '../address/';
import { preventDefault } from '../common/dom';
import { TranslatedString } from '../locale';
import { Button, ButtonSize, ButtonVariant } from '../ui/button';
import { LoadingOverlay } from '../ui/loading';

import './StaticAddressEditable.scss';

export interface StaticAddressEditableProps {
    address: Address;
    buttonId: string;
    isLoading: boolean;
    methodId?: string;
    deinitialize(options?: ShippingRequestOptions): Promise<CheckoutSelectors>;
    initialize(options?: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: Error): void;
}

class StaticAddressEditable extends PureComponent<StaticAddressEditableProps> {
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
            address,
            buttonId,
            isLoading,
        } = this.props;

        return (
            <LoadingOverlay isLoading={ isLoading }>
                <div className="stepHeader" style={ { padding: 0 } }>
                    <div className="stepHeader-body subheader">
                        <StaticAddress
                            address={ address }
                        />
                    </div>

                    <div className="stepHeader-actions subheader">
                        <Button
                            id={ buttonId }
                            onClick={ preventDefault() }
                            size={ ButtonSize.Tiny }
                            testId="step-edit-button"
                            variant={ ButtonVariant.Secondary }
                        >
                            <TranslatedString id="common.edit_action" />
                        </Button>
                    </div>
                </div>
            </LoadingOverlay>
        );
    }
}

export default StaticAddressEditable;
