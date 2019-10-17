import { AccountInstrument, Instrument } from '@bigcommerce/checkout-sdk';

export default function isAccountInstrument(instrument: Instrument): instrument is AccountInstrument {
    return instrument.type === 'account';
}
