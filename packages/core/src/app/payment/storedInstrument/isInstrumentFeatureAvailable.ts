import { CheckoutSettings, Customer, PaymentMethod, PaymentMethodConfig, StoreConfig } from '@bigcommerce/checkout-sdk';

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
    const { checkoutSettings } = config;

    if (
        isVaultingNotEnabled(checkoutSettings, paymentMethod.config) ||
        customer.isGuest ||
        isVaultingWithMultiShippingNotEnabled(checkoutSettings, isUsingMultiShipping)
    ) {
        return false;
    }

    return true;
}

function isVaultingNotEnabled(checkoutSettings: CheckoutSettings, paymentMethodConfig: PaymentMethodConfig): boolean {
    return !checkoutSettings.isCardVaultingEnabled || !paymentMethodConfig.isVaultingEnabled;
}

function isVaultingWithMultiShippingNotEnabled(checkoutSettings: CheckoutSettings, isUsingMultiShipping: boolean): boolean {
    if(checkoutSettings.features['PAYMENTS-7667.enable_vaulting_with_multishipping']) {
        return false;
    }

    return isUsingMultiShipping;
}
