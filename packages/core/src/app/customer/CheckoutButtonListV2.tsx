import React, { FunctionComponent } from 'react';

import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';

import { withCheckout, WithCheckoutProps } from '../checkout';

import resolveCheckoutButton from './resolveCheckoutButton';
import CheckoutButtonV1Resolver from './WalletButtonV1Resolver';

export interface CheckoutButtonListProps {
    methodIds: string[];
    onUnhandledError(error: Error): void;
}

const CheckoutButtonList: FunctionComponent<
    CheckoutButtonListProps & WithCheckoutProps & WithLanguageProps
> = ({
        checkoutService,
        checkoutState,
        language,
        methodIds,
        onUnhandledError,
    }) => {
    return (
        <>
            <div className="checkoutRemote">
                {methodIds.map((methodId) => {
                    const ResolvedCheckoutButton = resolveCheckoutButton({ id: methodId });

                    if (!ResolvedCheckoutButton) {
                        return <CheckoutButtonV1Resolver
                            deinitialize={checkoutService.deinitializeCustomer}
                            initialize={checkoutService.initializeCustomer}
                            isShowingWalletButtonsOnTop={true}
                            key={methodId}
                            methodId={methodId}
                            onError={onUnhandledError}
                        />
                    }

                    return (
                        <ResolvedCheckoutButton
                            checkoutService={checkoutService}
                            checkoutState={checkoutState}
                            containerId={`${methodId}CheckoutButton`}
                            key={methodId}
                            language={language}
                            methodId={methodId}
                            onUnhandledError={onUnhandledError}
                        />
                    );
                })}
            </div>
        </>
    );
};

export default withCheckout((props) => props)(withLanguage(CheckoutButtonList));
