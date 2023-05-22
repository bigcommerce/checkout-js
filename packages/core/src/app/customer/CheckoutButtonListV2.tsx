import React, { FunctionComponent } from 'react';

import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';

import { withCheckout, WithCheckoutProps } from '../checkout';

import { mapToCheckoutButtonHelperProps } from './mapToCheckoutButtonHelperProps';
import resolveCheckoutButton from './resolveCheckoutButton';
import CheckoutButtonV1Resolver from './WalletButtonV1Resolver';

export interface CheckoutButtonListProps {
    onUnhandledError(error: Error): void;
}

// const sortMethodIds = (methodIds:string[]):string[] => {
//     const order = [
//         'applepay',
//         'braintreepaypalcredit',
//         'braintreepaypal',
//         'paypalcommercevenmo',
//         'paypalcommercecredit',
//         'paypalcommerce',
//     ];

//     return methodIds.sort((a, b) => order.indexOf(b) - order.indexOf(a));
// }

const CheckoutButtonList: FunctionComponent<
    CheckoutButtonListProps & WithCheckoutProps & WithLanguageProps
> = ({ checkoutService, checkoutState, language, onUnhandledError }) => {
    const helperProps = mapToCheckoutButtonHelperProps({ checkoutService, checkoutState });

    if (helperProps === null) {
        return null;
    }

    const {
        availableMethodIds,
        deinitialize,
        initialize,
    } = helperProps;

    return (
        <>
            <div className="checkoutRemote">
                {availableMethodIds.map((methodId) => {
                    const ResolvedCheckoutButton = resolveCheckoutButton({ id: methodId });

                    if (!ResolvedCheckoutButton) {
                        return <CheckoutButtonV1Resolver
                            deinitialize={deinitialize}
                            initialize={initialize}
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
