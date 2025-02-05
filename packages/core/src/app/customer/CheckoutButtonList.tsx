import { CheckoutSettings, CustomerInitializeOptions, CustomerRequestOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import CheckoutButton from './CheckoutButton';
import { AmazonPayV2Button, ApplePayButton, PayPalCommerceButton } from './customWalletButton';
import { getSupportedMethodIds } from './getSupportedMethods';

export interface CheckoutButtonListProps {
    methodIds?: string[];
    isInitializing?: boolean;
    isShowingWalletButtonsOnTop?: boolean;
    hideText?: boolean;
    checkEmbeddedSupport?(methodIds: string[]): void;
    checkoutSettings: CheckoutSettings;
    deinitialize(options: CustomerRequestOptions): void;
    initialize(options: CustomerInitializeOptions): void;
    onError?(error: Error): void;
    onClick?(methodId: string): void;
}

const CheckoutButtonList: FunctionComponent<CheckoutButtonListProps> = ({
    checkEmbeddedSupport,
    onError,
    isInitializing = false,
    isShowingWalletButtonsOnTop= false,
    checkoutSettings,
    methodIds = [],
    hideText = false,
    ...rest
}) => {
    const supportedMethodIds = getSupportedMethodIds(methodIds, checkoutSettings);

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
            {!isInitializing && !hideText && (
                <p>
                    <TranslatedString id="remote.continue_with_text" />
                </p>
            )}

            <div className="checkoutRemote">
                {methodIds.map((methodId) => {
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

                    if (methodId === 'paypalcommerce' || methodId === 'paypalcommercecredit') {
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
                            isShowingWalletButtonsOnTop={isShowingWalletButtonsOnTop}
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
