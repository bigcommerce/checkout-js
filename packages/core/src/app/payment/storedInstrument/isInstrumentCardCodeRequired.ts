import { LineItemMap, PaymentInstrument, PaymentMethod } from '@bigcommerce/checkout-sdk';

import { UntrustedShippingCardVerificationType } from './CardInstrumentFieldset';

export const PROVIDERS_WITHOUT_CARD_CODE = ['bluesnapdirect'];

export interface IsInstrumentCardCodeRequiredState {
    instrument: PaymentInstrument;
    lineItems: LineItemMap;
    paymentMethod: PaymentMethod;
}

export default function isInstrumentCardCodeRequired({
    instrument,
    lineItems,
    paymentMethod,
}: IsInstrumentCardCodeRequiredState): boolean {
    if (PROVIDERS_WITHOUT_CARD_CODE.includes(instrument.provider)) {
        return false;
    }

    // If there's a digital item in the cart, always show CVV field
    if (lineItems.digitalItems.length > 0 || lineItems.giftCertificates.length > 0) {
        return true;
    }

    // If the shipping address is trusted, show CVV field based on the merchant's configuration
    if (instrument.trustedShippingAddress) {
        return !!paymentMethod.config.isVaultingCvvEnabled;
    }

    // If the shipping address is untrusted, card verficiation mode has set with cvv, card code is required
    if ('untrustedShippingCardVerificationMode' in instrument && instrument.untrustedShippingCardVerificationMode === UntrustedShippingCardVerificationType.CVV) {
        return true;
    }

    // Otherwise, if the shipping address is untrusted, show CVV field if the
    // merchant either requires it for regular card or stored card payments.
    return !!(paymentMethod.config.isVaultingCvvEnabled || paymentMethod.config.cardCode);
}
