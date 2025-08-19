import { type CustomerInitializeOptions, type CustomerRequestOptions } from "@bigcommerce/checkout-sdk";
import React, { type FunctionComponent, lazy, Suspense } from "react";

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
    onError,
    methodId,
    ...rest
}) => {
    switch (methodId) {
        case 'applepay':
            return <Suspense>
                <ApplePayButton
                    containerId={`${methodId}CheckoutButton`}
                    key={methodId}
                    methodId={methodId}
                    onError={onError}
                    {...rest}
                />
            </Suspense>;
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
