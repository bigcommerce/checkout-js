import { CustomerInitializeOptions, CustomerRequestOptions } from "@bigcommerce/checkout-sdk";
import { PayPalCommerceButton } from "@bigcommerce/checkout/paypal-commerce-integration";
import React, { FunctionComponent } from "react";

import CheckoutButton from "./CheckoutButton";
import { ApplePayButton } from "./customWalletButton";
import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";
import { useLocale } from "@bigcommerce/checkout/locale";

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
    onError,
    methodId,
    onClick,
    ...rest
}) => {
    const { checkoutService, checkoutState } = useCheckout();
    const { language } = useLocale();
    switch (methodId) {
        case 'applepay':
            return (
                <ApplePayButton
                    containerId={`${methodId}CheckoutButton`}
                    key={methodId}
                    methodId={methodId}
                    onError={onError}
                    {...rest}
                />
            );

        case 'paypalcommerce':
        case 'paypalcommercecredit':
            return (
                <PayPalCommerceButton
                    containerId={`${methodId}CheckoutButton`}
                    key={methodId}
                    methodId={methodId}
                    onUnhandledError={() => onError}
                    onWalletButtonClick={() => onClick}
                    checkoutService={checkoutService}
                    checkoutState={checkoutState}
                    language={language}
                    {...rest}
                />
            );
    }

    return <CheckoutButton
            containerId={`${methodId}CheckoutButton`}
            isShowingWalletButtonsOnTop={isShowingWalletButtonsOnTop}
            key={methodId}
            methodId={methodId}
            onError={onError}
            {...rest}
        />;
};

export default CheckoutButtonV1Resolver;
