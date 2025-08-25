import { type CheckoutPayment, type OrderPayment } from '@bigcommerce/checkout-sdk';

export default function isStoreCreditPayment(payment: OrderPayment | CheckoutPayment): boolean {
    return payment.providerId === 'storecredit';
}
