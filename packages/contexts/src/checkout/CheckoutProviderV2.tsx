import { type CheckoutService } from '@bigcommerce/checkout-sdk';
import React, { type ReactElement, type ReactNode } from 'react';

import { CheckoutContextV2 } from './CheckoutContextV2';
import type ErrorLogger from './ErrorLogger';

export interface CheckoutProviderProps {
    checkoutService: CheckoutService;
    children: ReactNode;
    errorLogger?: ErrorLogger;
    isUseCheckoutHookExperimentEnabled?: boolean;
}

export const CheckoutProviderV2 = ({
    checkoutService,
    errorLogger,
    children,
    isUseCheckoutHookExperimentEnabled,
}: CheckoutProviderProps): ReactElement => {
    const checkoutState = checkoutService.getState();
    const contextValue = {
        checkoutService,
        checkoutState, // TODO: this can be removed once experiment is over
        errorLogger,
        isUseCheckoutHookExperimentEnabled,
    };

    return <CheckoutContextV2.Provider value={contextValue}>{children}</CheckoutContextV2.Provider>;
};
