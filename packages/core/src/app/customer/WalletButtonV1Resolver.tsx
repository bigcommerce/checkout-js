import { CustomerInitializeOptions, CustomerRequestOptions } from "@bigcommerce/checkout-sdk";
import { createBigCommercePaymentsFastlaneCustomerStrategy, createBigCommercePaymentsVenmoCustomerStrategy, createBoltCustomerStrategy, createBraintreeFastlaneCustomerStrategy, createBraintreePaypalCreditCustomerStrategy, createBraintreePaypalCustomerStrategy, createBraintreeVisaCheckoutCustomerStrategy, createPayPalCommerceFastlaneCustomerStrategy, createPayPalCommerceVenmoCustomerStrategy, createStripeLinkV2CustomerStrategy, createStripeUPECustomerStrategy } from "@bigcommerce/checkout-sdk/integrations";
import React, { FunctionComponent, useCallback } from "react";

import CheckoutButton from "./CheckoutButton";
import { ApplePayButton } from "./customWalletButton";

interface CheckoutButtonV1ResolverProps {
    methodId: string;
    deinitialize(options: CustomerRequestOptions): void;
    isShowingWalletButtonsOnTop?: boolean;
    initialize(options: CustomerInitializeOptions): void;
    onError?(error: Error): void;
    onClick?(methodName: string): void;
}

const CheckoutButtonV1Resolver: FunctionComponent<CheckoutButtonV1ResolverProps> = ({
    isShowingWalletButtonsOnTop= false,
    initialize,
    onError,
    methodId,
    ...rest
}) => {
    const initializeWithIntegrations = useCallback(
        (options: CustomerInitializeOptions) => {
            return initialize({
                ...options,
                integrations: [
                    createBigCommercePaymentsFastlaneCustomerStrategy,
                    createBigCommercePaymentsVenmoCustomerStrategy,
                    createBoltCustomerStrategy,
                    createBraintreePaypalCustomerStrategy,
                    createBraintreePaypalCreditCustomerStrategy,
                    createBraintreeFastlaneCustomerStrategy,
                    createBraintreeVisaCheckoutCustomerStrategy,
                    createPayPalCommerceVenmoCustomerStrategy,
                    createPayPalCommerceFastlaneCustomerStrategy,
                    createStripeUPECustomerStrategy,
                    createStripeLinkV2CustomerStrategy,
                ],
            });
        },
        [initialize],
    );

    switch (methodId) {
        case 'applepay':
            return (
                <ApplePayButton
                    containerId={`${methodId}CheckoutButton`}
                    initialize={initialize}
                    key={methodId}
                    methodId={methodId}
                    onError={onError}
                    {...rest}
                />
            );
    }

    return <CheckoutButton
            containerId={`${methodId}CheckoutButton`}
            initialize={initializeWithIntegrations}
            isShowingWalletButtonsOnTop={isShowingWalletButtonsOnTop}
            key={methodId}
            methodId={methodId}
            onError={onError}
            {...rest}
        />;
};

export default CheckoutButtonV1Resolver;
