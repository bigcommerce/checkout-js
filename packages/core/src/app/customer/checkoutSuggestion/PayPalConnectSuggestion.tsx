import {
    CheckoutSelectors,
    CustomerInitializeOptions,
    CustomerRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { FunctionComponent, memo, useEffect } from 'react';

export interface PayPalConnectSuggestionProps {
    methodId: string;
    deinitializeCustomer(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    initializeCustomer(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: Error): void;
}

const PayPalConnectSuggestion: FunctionComponent<PayPalConnectSuggestionProps> = ({
    methodId,
    deinitializeCustomer,
    initializeCustomer,
    onUnhandledError = noop,
}) => {
    useEffect(() => {
        deinitializeCustomer({ methodId });

        try {
            initializeCustomer({
                methodId,
                braintreeacceleratedcheckout: {
                    authenticateOnInitialization: true,
                },
            });
        } catch (error) {
            onUnhandledError(error);
        }

        return () => {
            deinitializeCustomer({ methodId });
        };
    }, [initializeCustomer, deinitializeCustomer, methodId, onUnhandledError]);

    return <></>;
};

export default memo(PayPalConnectSuggestion);
