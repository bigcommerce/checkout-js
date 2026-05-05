import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { type PaymentMethodFilter, type PaymentMethodFilterContext } from '@bigcommerce/checkout/payment-integration-api';
import { stripeMethodsFiltering } from '@bigcommerce/checkout/stripe-utils';

import { boltAndBraintreeFilter } from './boltAndBraintreeFilter';
import { excludePPSDKFilter } from './excludePPSDKFilter';
import { multiShippingFilter } from './multiShippingFilter';
import { selectedHostedPaymentFilter } from './selectedHostedPaymentFilter';

// Order matters. selectedHostedPaymentFilter must run last because it can
// collapse the list to a single method when a hosted payment is already in flight.
const FILTERS: PaymentMethodFilter[] = [
    stripeMethodsFiltering,
    boltAndBraintreeFilter,
    multiShippingFilter,
    excludePPSDKFilter,
    selectedHostedPaymentFilter,
];

export function applyPaymentMethodFilters(
    methods: PaymentMethod[],
    context: PaymentMethodFilterContext,
): PaymentMethod[] {
    return FILTERS.reduce((acc, filter) => filter.apply(acc, context), methods);
}
