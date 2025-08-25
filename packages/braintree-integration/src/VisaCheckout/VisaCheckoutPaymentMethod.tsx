import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useCallback } from 'react';

import {
    type CheckoutButtonResolveId,
    PaymentMethodId,
    type PaymentMethodProps,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { WalletButtonPaymentMethodComponent } from '@bigcommerce/checkout/wallet-button-integration';

const VisaCheckoutPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    method,
    onUnhandledError,
    ...rest
}) => {
    const initializeVisaCheckoutPayment = useCallback(
        (defaultOptions: PaymentInitializeOptions) => {
            const reinitializePayment = async (options: PaymentInitializeOptions) => {
                try {
                    await checkoutService.deinitializePayment({
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });

                    await checkoutService.initializePayment({
                        ...options,
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });
                } catch (error) {
                    if (error instanceof Error) {
                        onUnhandledError(error);
                    }
                }
            };

            const mergedOptions = {
                ...defaultOptions,
                braintreevisacheckout: {
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
            };

            return checkoutService.initializePayment(mergedOptions);
        },
        [checkoutService, method, onUnhandledError],
    );

    return (
        <WalletButtonPaymentMethodComponent
            {...rest}
            buttonId="visaCheckoutWalletButton"
            deinitializePayment={checkoutService.deinitializePayment}
            editButtonClassName="v-button"
            initializePayment={initializeVisaCheckoutPayment}
            method={method}
            shouldShowEditButton
            signInButtonClassName="v-button"
            signOutCustomer={checkoutService.signOutCustomer}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, CheckoutButtonResolveId>(
    VisaCheckoutPaymentMethod,
    [{ id: PaymentMethodId.BraintreeVisaCheckout }],
);
