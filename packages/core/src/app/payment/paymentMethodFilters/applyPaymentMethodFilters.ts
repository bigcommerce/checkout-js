import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { boltAndBraintreeFilter } from './boltAndBraintreeFilter';
import { multiShippingFilter } from './multiShippingFilter';
import { selectedHostedPaymentFilter } from './selectedHostedPaymentFilter';
import { stripeLinkAuthFilter } from './stripeLinkAuthFilter';
import { type PaymentMethodFilter, type PaymentMethodFilterContext } from './types';

// Order matters. selectedHostedPaymentFilter must run last because it can
// collapse the list to a single method when a hosted payment is already in flight.
const FILTERS: PaymentMethodFilter[] = [
    stripeLinkAuthFilter,
    boltAndBraintreeFilter,
    multiShippingFilter,
    selectedHostedPaymentFilter,
];

export function applyPaymentMethodFilters(
    methods: PaymentMethod[],
    context: PaymentMethodFilterContext,
): PaymentMethod[] {
    return FILTERS.reduce((acc, filter) => filter.apply(acc, context), methods);
}
