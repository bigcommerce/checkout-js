import {
    type CheckoutSelectors,
    type CheckoutService,
    type ErrorLogger,
    type LanguageService,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';

import type PaymentFormService from './PaymentFormService';

export default interface PaymentMethodProps {
    children?: React.ReactNode;
    method: PaymentMethod;
    checkoutService: CheckoutService;
    checkoutState: CheckoutSelectors;
    paymentForm: PaymentFormService;
    language: LanguageService;
    errorLogger?: ErrorLogger;
    onUnhandledError(error: Error): void;
}
