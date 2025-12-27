import { type CheckoutSelectors, type CheckoutService } from '@bigcommerce/checkout-sdk';
import { createContext } from 'react';

import type ErrorLogger from './ErrorLogger';

export interface CheckoutContextV2Props {
    checkoutService: CheckoutService;
    checkoutState: CheckoutSelectors;
    errorLogger?: ErrorLogger;
    isUseCheckoutHookExperimentEnabled?: boolean;
}

export const CheckoutContextV2 = createContext<CheckoutContextV2Props | undefined>(undefined);
