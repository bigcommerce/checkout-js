import { Instrument, LineItemMap, PaymentMethod } from '@bigcommerce/checkout-sdk';

export interface IsInstrumentCardNumberRequiredState {
    lineItems: LineItemMap;
    instrument: Instrument;
    paymentMethod?: PaymentMethod;
}

export default function isInstrumentCardNumberRequired({
    lineItems,
    instrument,
    paymentMethod,
}: IsInstrumentCardNumberRequiredState): boolean {
    const { isVaultingCardNumberValidationAvailable = true } =
        paymentMethod?.initializationData || {};

    if (lineItems.physicalItems.length === 0 || !isVaultingCardNumberValidationAvailable) {
        return false;
    }

    return !instrument.trustedShippingAddress;
}
