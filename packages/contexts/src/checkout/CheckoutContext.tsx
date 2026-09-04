import { type CheckoutSelectors, type CheckoutService } from '@bigcommerce/checkout-sdk';
import { createContext } from 'react';

import type ErrorLogger from './ErrorLogger';

export interface CheckoutContextProps {
    checkoutService: CheckoutService;
    checkoutState: CheckoutSelectors;
    errorLogger?: ErrorLogger;
}

const CheckoutContext = createContext<CheckoutContextProps | undefined>(undefined);

export default CheckoutContext;
