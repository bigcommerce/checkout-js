import { CardInstrument, PaymentInstrument } from '@bigcommerce/checkout-sdk';

export function isCardInstrument(instrument?: PaymentInstrument): instrument is CardInstrument {
    return instrument !== undefined && instrument.type === 'card';
}

export default function assertIsCardInstrument(
    instrument?: PaymentInstrument,
): asserts instrument is CardInstrument {
    if (!isCardInstrument(instrument)) {
        throw new Error('Is not a card instrument.');
    }
}
