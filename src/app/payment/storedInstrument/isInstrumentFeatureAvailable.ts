import { Consignment, Customer, LineItemMap, PaymentMethod, StoreConfig } from '@bigcommerce/checkout-sdk';

import { isUsingMultiShipping } from '../../shipping';

export interface IsInstrumentFeatureAvailableState {
    config: StoreConfig;
    consignments: Consignment[];
    customer: Customer;
    lineItems: LineItemMap;
    paymentMethod: PaymentMethod;
}

export default function isInstrumentFeatureAvailable({
    config,
    consignments,
    customer,
    lineItems,
    paymentMethod,
}: IsInstrumentFeatureAvailableState): boolean {
    if (!config.checkoutSettings.isCardVaultingEnabled ||
        !paymentMethod.config.isVaultingEnabled ||
        customer.isGuest ||
        isUsingMultiShipping(consignments, lineItems)) {
        return false;
    }

    return true;
}
