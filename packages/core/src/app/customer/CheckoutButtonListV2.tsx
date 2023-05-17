import React, { FunctionComponent } from 'react';

import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';

import { withCheckout, WithCheckoutProps } from '../checkout';

import { mapToCheckoutButtonHelperProps } from './mapToCheckoutButtonHelperProps';
import resolveCheckoutButton from './resolveCheckoutButton';

export interface CheckoutButtonListProps {
    onUnhandledError(error: Error): void;
}


const CheckoutButtonList: FunctionComponent<
    CheckoutButtonListProps & WithCheckoutProps & WithLanguageProps
> = ({ checkoutService, checkoutState, language, onUnhandledError }) => {
    const {
        statuses: { isInitializingCustomer },
        data: { getConfig },
    } = checkoutState;

    const helperProps = mapToCheckoutButtonHelperProps({ checkoutService, checkoutState });

    if (helperProps === null) {
        return null;
    }

    const {
        availableMethodIds,
        deinitialize,
        initialize,
        initializedMethodIds,
        isLoading,
        isPaypalCommerce,
    } = helperProps;

    console.log(availableMethodIds,
        deinitialize,
        initialize,
        initializedMethodIds,
        isLoading,
        isPaypalCommerce);

    return (
        <>
            {!isInitializingCustomer() && (
                <p>
                    <TranslatedString id="remote.continue_with_text" />
                </p>
            )}

            <div className="checkoutRemote">
                {availableMethodIds.map((methodId) => {
                    const ResolvedCheckoutButton = resolveCheckoutButton({ id: methodId });

                    if (!ResolvedCheckoutButton) {
                        return null;
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
