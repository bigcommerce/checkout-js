import { Instrument, LineItemMap, StoreConfig } from '@bigcommerce/checkout-sdk';

export interface IsInstrumentCardNumberRequiredState {
    config: StoreConfig;
    lineItems: LineItemMap;
    instrument: Instrument;
}

export default function isInstrumentCardNumberRequired({
    config,
    lineItems,
    instrument,
}: IsInstrumentCardNumberRequiredState): boolean {
    if (!(config.checkoutSettings as any).isTrustedShippingAddressEnabled ||
        lineItems.physicalItems.length === 0) {
        return false;
    }

    return !instrument.trustedShippingAddress;
}
