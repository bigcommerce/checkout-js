import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

export default function isPaymentMethodAutoVaultingInstruments(
    paymentMethod: PaymentMethod,
): boolean {
    return Boolean(paymentMethod.config.shouldVaultAllPayments);
}
