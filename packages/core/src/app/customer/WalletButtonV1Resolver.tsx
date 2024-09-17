import { CustomerInitializeOptions, CustomerRequestOptions } from "@bigcommerce/checkout-sdk";
import React, { FunctionComponent } from "react";

import CheckoutButton from "./CheckoutButton";
import { AmazonPayV2Button, ApplePayButton, PayPalCommerceButton } from "./customWalletButton";

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
    ...rest
}) => {
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

        case 'amazonpay':
            return (
                <AmazonPayV2Button
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
                    onError={onError}
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
