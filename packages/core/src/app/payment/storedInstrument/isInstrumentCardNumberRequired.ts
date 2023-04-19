import { Instrument, LineItemMap } from '@bigcommerce/checkout-sdk';

import { UntrustedShippingCardVerificationType } from './CardInstrumentFieldset';

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

    if (instrument.trustedShippingAddress) {
        return false;
    }  
    
    return !(instrument.untrustedShippingCardVerificationMode === UntrustedShippingCardVerificationType.CVV);
}
