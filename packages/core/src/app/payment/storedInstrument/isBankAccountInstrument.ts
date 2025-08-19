import { type AchInstrument, type BankInstrument, type PaymentInstrument } from '@bigcommerce/checkout-sdk';

export default function isBankAccountInstrument(
    instrument: PaymentInstrument,
): instrument is BankInstrument | AchInstrument {
    return instrument.type === 'bank';
}
