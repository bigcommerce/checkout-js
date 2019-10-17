import { CardInstrument, Instrument } from '@bigcommerce/checkout-sdk';

export default function isCardInstrument(instrument: Instrument): instrument is CardInstrument {
    return instrument.type === 'card';
}
