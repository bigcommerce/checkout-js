import { CheckoutSelectors, CheckoutService, LanguageService, PaymentMethod } from '@bigcommerce/checkout-sdk';

import { PaymentFormService } from '../../payment';

export default interface PaymentMethodProps {
    method: PaymentMethod;
    checkoutService: CheckoutService;
    checkoutState: CheckoutSelectors;
    paymentForm: PaymentFormService;
    language: LanguageService;
    onUnhandledError(error: Error): void;
}
