import { Customer, PaymentMethod, StoreConfig } from '@bigcommerce/checkout-sdk';

export interface IsInstrumentFeatureAvailableState {
    config: StoreConfig;
    customer: Customer;
    isUsingMultiShipping: boolean;
    paymentMethod: PaymentMethod;
}

export default function isInstrumentFeatureAvailable({
    config,
    customer,
    isUsingMultiShipping,
    paymentMethod,
}: IsInstrumentFeatureAvailableState): boolean {
    if (
        !config.checkoutSettings.isCardVaultingEnabled ||
        !paymentMethod.config.isVaultingEnabled ||
        customer.isGuest ||
        isUsingMultiShipping
    ) {
        return false;
    }

    return true;
}
