import { CustomerInitializeOptions, CustomerRequestOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { isApplePayWindow } from '../common/utility';
import { TranslatedString } from '../locale';

import CheckoutButton from './CheckoutButton';
import { AmazonPayV2Button, ApplePayButton, PayPalCommerceButton } from './customWalletButton';

const APPLE_PAY = 'applepay';

// TODO: The API should tell UI which payment method offers its own checkout button
export const SUPPORTED_METHODS: string[] = [
    'amazonpay',
    APPLE_PAY,
    'braintreevisacheckout',
    'braintreepaypal',
    'braintreepaypalcredit',
    'chasepay',
    'masterpass',
    'paypalcommerce',
    'paypalcommercevenmo',
    'googlepayadyenv2',
    'googlepayadyenv3',
    'googlepayauthorizenet',
    'googlepaybnz',
    'googlepaybraintree',
    'googlepaycheckoutcom',
    'googlepaycybersourcev2',
    'googlepayorbital',
    'googlepaystripe',
    'googlepaystripeupe',
];

export interface CheckoutButtonListProps {
    methodIds?: string[];
    isInitializing?: boolean;
    copywritingStringId?: string;
    checkEmbeddedSupport?(methodIds: string[]): void;
    deinitialize(options: CustomerRequestOptions): void;
    initialize(options: CustomerInitializeOptions): void;
    onError?(error: Error): void;
}

const CheckoutButtonList: FunctionComponent<CheckoutButtonListProps> = ({
    checkEmbeddedSupport,
    onError,
    isInitializing = false,
    methodIds,
    copywritingStringId='remote.continue_with_text',
    ...rest
}) => {
    const supportedMethodIds = (methodIds ?? []).filter((methodId) => {
        if (methodId === APPLE_PAY && !isApplePayWindow(window)) {
            return false;
        }

        return SUPPORTED_METHODS.indexOf(methodId) !== -1;
    });

    if (supportedMethodIds.length === 0) {
        return null;
    }

    if (checkEmbeddedSupport) {
        try {
            checkEmbeddedSupport(supportedMethodIds);
        } catch (error) {
            if (error instanceof Error && onError) {
                onError(error);
            } else {
                throw error;
            }

            return null;
        }
    }

    return (
        <>
            {!isInitializing && (
                <p>
                    <TranslatedString id={copywritingStringId} />
                </p>
            )}

            <div className="checkoutRemote">
                {supportedMethodIds.map((methodId) => {
                    if (methodId === 'applepay') {
                        return (
                            <ApplePayButton
                                containerId={`${methodId}CheckoutButton`}
                                key={methodId}
                                methodId={methodId}
                                onError={onError}
                                {...rest}
                            />
                        );
                    }

                    if (methodId === 'amazonpay') {
                        return (
                            <AmazonPayV2Button
                                containerId={`${methodId}CheckoutButton`}
                                key={methodId}
                                methodId={methodId}
                                onError={onError}
                                {...rest}
                            />
                        );
                    }

                    if (methodId === 'paypalcommerce') {
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

                    return (
                        <CheckoutButton
                            containerId={`${methodId}CheckoutButton`}
                            key={methodId}
                            methodId={methodId}
                            onError={onError}
                            {...rest}
                        />
                    );
                })}
            </div>
        </>
    );
};

export default memo(CheckoutButtonList);
