import { PaymentMethodId as PaymentMethodIdOriginal } from '@bigcommerce/checkout/payment-integration-api';

enum PaymentMethodIdExtended {
    Recurly = 'recurly',
}

type PaymentMethodId = PaymentMethodIdOriginal & PaymentMethodIdExtended;

const PaymentMethodId = {
    ...PaymentMethodIdOriginal,
    ...PaymentMethodIdExtended
}

export default PaymentMethodId;
