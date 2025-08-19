import { type CheckoutSettings, type Customer, type PaymentMethod, type PaymentMethodConfig, type StoreConfig } from '@bigcommerce/checkout-sdk';

export interface IsInstrumentFeatureAvailableState {
    config: StoreConfig;
    customer: Customer;
    paymentMethod: PaymentMethod;
    shouldSavingCardsBeEnabled?: boolean;
}

export default function isInstrumentFeatureAvailable({
    config,
    customer,
    paymentMethod,
    shouldSavingCardsBeEnabled = true,
}: IsInstrumentFeatureAvailableState): boolean {
    const { checkoutSettings } = config;

    if (
        isVaultingNotEnabled(checkoutSettings, paymentMethod.config) ||
        customer.isGuest ||
        !shouldSavingCardsBeEnabled
    ) {
        return false;
    }

    return true;
}

function isVaultingNotEnabled(checkoutSettings: CheckoutSettings, paymentMethodConfig: PaymentMethodConfig): boolean {
    return !checkoutSettings.isCardVaultingEnabled || !paymentMethodConfig.isVaultingEnabled;
}
