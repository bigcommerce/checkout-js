import { PaymentMethod } from "@bigcommerce/checkout-sdk";

export default function filterPaymentMethods(paymentMethods: PaymentMethod[], isSubscriptionEnabled: boolean | undefined): PaymentMethod[] {
    if (!isSubscriptionEnabled) return paymentMethods;

    return paymentMethods.filter(method =>
        method.method === "card" || method.method === "credit-card"
    );
}
