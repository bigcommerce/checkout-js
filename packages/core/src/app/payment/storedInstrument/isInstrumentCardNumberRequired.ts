import { Instrument, LineItemMap } from '@bigcommerce/checkout-sdk';

export interface IsInstrumentCardNumberRequiredState {
    lineItems: LineItemMap;
    instrument: Instrument;
}

export default function isInstrumentCardNumberRequired({
    lineItems,
    instrument,
}: IsInstrumentCardNumberRequiredState): boolean {
    if (lineItems.physicalItems.length === 0) {
        return false;
    }

    return !instrument.trustedShippingAddress;
}
