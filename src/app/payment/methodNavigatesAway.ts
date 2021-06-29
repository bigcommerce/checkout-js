import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { isString } from 'lodash';

import { PaymentMethodId, PaymentMethodProviderType } from './paymentMethod';

// TODO: consider adding a `navigatesAway` attribute to PaymentMethod objects

const typesThatNavigateAway: string[] = [
    PaymentMethodProviderType.PPSDK,
    PaymentMethodProviderType.Hosted,
];

const idsThatNavigateAway: string[] = [
    PaymentMethodId.Amazon,
    PaymentMethodId.AmazonPay,
    PaymentMethodId.Checkoutcom,
    PaymentMethodId.Converge,
    PaymentMethodId.Laybuy,
    PaymentMethodId.Quadpay,
    PaymentMethodId.SagePay,
    PaymentMethodId.Sezzle,
    PaymentMethodId.Zip,
];

const gatewaysThatNavigateAway: string[] = [
    PaymentMethodId.AdyenV2,
    PaymentMethodId.AdyenV2GooglePay,
    PaymentMethodId.Afterpay,
    PaymentMethodId.Clearpay,
    PaymentMethodId.Checkoutcom,
    PaymentMethodId.Mollie,
    PaymentMethodId.StripeV3,
];

export const methodNavigatesAway = (method: Pick<PaymentMethod, 'type' | 'id' | 'gateway'>): boolean =>
    typesThatNavigateAway.includes(method.type) ||
    idsThatNavigateAway.includes(method.id) ||
    (isString(method.gateway) && gatewaysThatNavigateAway.includes(method.gateway));
