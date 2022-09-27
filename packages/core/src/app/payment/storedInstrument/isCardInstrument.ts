import { CardInstrument, PaymentInstrument } from '@bigcommerce/checkout-sdk';

export default function isCardInstrument(
    instrument: PaymentInstrument,
): instrument is CardInstrument {
    return instrument.type === 'card';
}
