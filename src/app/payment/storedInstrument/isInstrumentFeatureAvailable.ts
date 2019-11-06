import { Customer, PaymentMethod, StoreConfig } from '@bigcommerce/checkout-sdk';

export interface IsInstrumentFeatureAvailableState {
    config: StoreConfig;
    customer: Customer;
    isUsingMultiShipping: boolean;
    paymentMethod: PaymentMethod;
    orderIsComplete?: boolean;
}

export default function isInstrumentFeatureAvailable({
    config,
    customer,
    isUsingMultiShipping,
    paymentMethod,
    orderIsComplete,
}: IsInstrumentFeatureAvailableState): boolean {
    if (!config.checkoutSettings.isCardVaultingEnabled ||
        !paymentMethod.config.isVaultingEnabled ||
        customer.isGuest ||
        isUsingMultiShipping ||
        orderIsComplete
    ) {
        return false;
    }

    return true;
}
