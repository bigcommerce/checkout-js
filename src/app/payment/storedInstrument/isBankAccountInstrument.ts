import { BankInstrument, PaymentInstrument } from '@bigcommerce/checkout-sdk';

export default function isBankAccountInstrument(instrument: PaymentInstrument): instrument is BankInstrument {
    return instrument.type === 'bank';
}
