import { LineItemMap, PaymentMethod, StoreConfig } from '@bigcommerce/checkout-sdk';

export interface IsInstrumentCardCodeRequiredState {
    config: StoreConfig;
    lineItems: LineItemMap;
    paymentMethod: PaymentMethod;
}

export default function isInstrumentCardCodeRequired({
    config,
    lineItems,
    paymentMethod,
}: IsInstrumentCardCodeRequiredState): boolean {
    if (config.checkoutSettings.isTrustedShippingAddressEnabled !== true ||
        lineItems.digitalItems.length > 0 ||
        lineItems.giftCertificates.length > 0 ||
        paymentMethod.config.isVaultingCvvEnabled ||
        paymentMethod.config.cardCode) {
        return true;
    }

    return false;
}
