import {ReactNode} from "react";
import {
    CheckoutSelectors,
    PaymentInitializeOptions,
    PaymentMethod,
    PaymentRequestOptions
} from "@bigcommerce/checkout-sdk";

export interface HostedPaymentMethodProps {
    description?: ReactNode;
    isInitializing?: boolean;
    isUsingMultiShipping?: boolean;
    method: PaymentMethod;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: Error): void;
}
