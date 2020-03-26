import { AccountInstrument, PaymentInstrument } from '@bigcommerce/checkout-sdk';

export default function isBankAccountInstrument(instrument: PaymentInstrument): instrument is AccountInstrument {
    return instrument.type === 'bank';
}
