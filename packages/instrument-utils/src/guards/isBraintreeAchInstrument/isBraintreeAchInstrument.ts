import { BraintreeAchInstrument, PaymentInstrument } from '@bigcommerce/checkout-sdk';

export default function isBraintreeAchInstrument(
    instrument: PaymentInstrument,
): instrument is BraintreeAchInstrument {
    return instrument.method === 'ach';
}
