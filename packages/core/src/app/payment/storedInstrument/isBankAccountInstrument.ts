import { BankInstrument, BraintreeAchInstrument, PaymentInstrument } from '@bigcommerce/checkout-sdk';

export default function isBankAccountInstrument(
    instrument: PaymentInstrument,
): instrument is BankInstrument | BraintreeAchInstrument {
    return instrument.type === 'bank';
}
