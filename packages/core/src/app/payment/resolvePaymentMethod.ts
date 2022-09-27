import { ComponentType } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
} from '@bigcommerce/checkout/payment-integration-api';

import { resolveComponent } from '../common/resolver';
import * as paymentMethods from '../generated/paymentIntegrations';

export default function resolvePaymentMethod(
    query: PaymentMethodResolveId,
): ComponentType<PaymentMethodProps> | undefined {
    return resolveComponent<PaymentMethodResolveId, PaymentMethodProps>(query, paymentMethods);
}
