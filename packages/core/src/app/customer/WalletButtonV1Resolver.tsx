import { type CustomerInitializeOptions, type CustomerRequestOptions } from "@bigcommerce/checkout-sdk";
import { createBigCommercePaymentsFastlaneCustomerStrategy, createBigCommercePaymentsVenmoCustomerStrategy } from "@bigcommerce/checkout-sdk/integrations/bigcommerce-payments";
import { createBoltCustomerStrategy } from "@bigcommerce/checkout-sdk/integrations/bolt";
import { createBraintreeFastlaneCustomerStrategy, createBraintreePaypalCreditCustomerStrategy, createBraintreePaypalCustomerStrategy, createBraintreeVisaCheckoutCustomerStrategy } from "@bigcommerce/checkout-sdk/integrations/braintree";
import { createPayPalCommerceFastlaneCustomerStrategy, createPayPalCommerceVenmoCustomerStrategy } from "@bigcommerce/checkout-sdk/integrations/paypal-commerce";
import { createStripeLinkV2CustomerStrategy, createStripeUPECustomerStrategy } from "@bigcommerce/checkout-sdk/integrations/stripe";
import React, { type FunctionComponent, lazy, Suspense, useCallback } from "react";

import CheckoutButton from "./CheckoutButton";

const ApplePayButton = lazy(() => import(/* webpackChunkName: "apple-pay-button" */'./customWalletButton/ApplePayButton'));

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
            return <Suspense>
                <ApplePayButton
                    containerId={`${methodId}CheckoutButton`}
                    initialize={initialize}
                    key={methodId}
                    methodId={methodId}
                    onError={onError}
                    {...rest}
                />
            </Suspense>;
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
