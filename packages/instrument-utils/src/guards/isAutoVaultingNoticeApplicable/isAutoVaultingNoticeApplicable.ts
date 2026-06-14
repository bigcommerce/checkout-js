import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

export interface IsAutoVaultingNoticeApplicableState {
    paymentMethod: PaymentMethod;
}

export default function isAutoVaultingNoticeApplicable({
    paymentMethod,
}: IsAutoVaultingNoticeApplicableState): boolean {
    return Boolean(paymentMethod.config.shouldVaultAllPayments);
}
