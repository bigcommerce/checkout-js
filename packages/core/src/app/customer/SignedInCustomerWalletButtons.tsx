import {
    type CheckoutSelectors,
    type CustomerInitializeOptions,
    type CustomerRequestOptions,
} from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { type CheckoutContextProps } from '@bigcommerce/checkout/contexts';

import { withCheckout } from '../checkout';

import CheckoutButtonList from './CheckoutButtonList';

interface SignedInCustomerWalletButtonsProps {
    checkEmbeddedSupport?(methodIds: string[]): void;
    onUnhandledError?(error: Error): void;
    onWalletButtonClick?(methodName: string): void;
}

interface WithCheckoutSignedInCustomerWalletButtonsProps {
    checkoutButtonIds: string[];
    isInitializingCustomer: boolean;
    showWalletButtons: boolean;
    deinitializeCustomer(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    initializeCustomer(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
}

const SignedInCustomerWalletButtons: FunctionComponent<
    SignedInCustomerWalletButtonsProps & WithCheckoutSignedInCustomerWalletButtonsProps
> = ({
    checkoutButtonIds,
    isInitializingCustomer,
    showWalletButtons,
    checkEmbeddedSupport,
    deinitializeCustomer,
    initializeCustomer,
    onUnhandledError,
    onWalletButtonClick,
}) => {
    if (!showWalletButtons) {
        return null;
    }

    return (
        <div className="signedInCustomerWalletButtons">
            <CheckoutButtonList
                checkEmbeddedSupport={checkEmbeddedSupport}
                deinitialize={deinitializeCustomer}
                initialize={initializeCustomer}
                isInitializing={isInitializingCustomer}
                methodIds={checkoutButtonIds}
                onClick={onWalletButtonClick}
                onError={onUnhandledError}
            />
        </div>
    );
};

function mapToWithCheckoutSignedInCustomerWalletButtonsProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutSignedInCustomerWalletButtonsProps | null {
    const {
        data: { getCustomer, getConfig, isPaymentDataRequired },
        statuses: { isInitializingCustomer },
    } = checkoutState;

    const customer = getCustomer();
    const config = getConfig();

    if (!customer || !config) {
        return null;
    }

    const { checkoutSettings } = config;
    const isWalletButtonsOnTop = Boolean(
        checkoutSettings.checkoutUserExperienceSettings?.walletButtonsOnTop,
    );

    return {
        checkoutButtonIds: checkoutSettings.remoteCheckoutProviders,
        isInitializingCustomer: isInitializingCustomer(),
        showWalletButtons: !customer.isGuest && !isWalletButtonsOnTop && isPaymentDataRequired(),
        deinitializeCustomer: checkoutService.deinitializeCustomer,
        initializeCustomer: checkoutService.initializeCustomer,
    };
}

export default withCheckout(mapToWithCheckoutSignedInCustomerWalletButtonsProps)(
    SignedInCustomerWalletButtons,
);
