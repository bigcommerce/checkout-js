import { noop } from 'lodash';
import React, {FunctionComponent, useEffect} from 'react';
import { CustomerRequestOptions, CustomerInitializeOptions } from '@bigcommerce/checkout-sdk';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

interface CheckoutButtonProps { // TODO: MOVE TO PROPER PLACE
    containerId: string;
    methodId: string;
    isShowingWalletButtonsOnTop?: boolean;
    deinitialize(options: CustomerRequestOptions): void;
    initialize(options: CustomerInitializeOptions): void;
    onError?(error: Error): void;
    onClick?(methodId: string): void;
};

const PayPalCommerceButton: FunctionComponent<CheckoutButtonProps> = ({
    methodId,
    onError,
    onClick = noop,
    containerId,
}) => {
    const { checkoutService } = useCheckout();
    useEffect(() => {
        const initializePayment = async () => {
            try {
                await checkoutService.initializeCustomer({
                    methodId,
                    [methodId]: {
                        container: containerId,
                        onError,
                        onClick: () => onClick(methodId),
                        onComplete: () => {}, //TODO: Add navigateToOrderConfirmation
                    },
                });
            } catch (error) {
                if (error instanceof Error) {
                    if (onError) {
                        onError(error);
                    }
                }
            }
        };

        void initializePayment();

        return () => {
            const deinitializePayment = async () => {
                try {
                    await checkoutService.deinitializePayment({
                        methodId,
                    });
                } catch (error) {
                    if (error instanceof Error) {
                        if (onError) {
                            onError(error);
                        }
                    }
                }
            };

            void deinitializePayment();
        };
    }, [checkoutService, onError]);

    return <div id={containerId}></div>
};

export default PayPalCommerceButton;
