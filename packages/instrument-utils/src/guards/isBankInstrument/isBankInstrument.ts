import { AchInstrument, BankInstrument, PaymentInstrument } from '@bigcommerce/checkout-sdk';

export function isBankAccountInstrument(
    instrument?: PaymentInstrument,
): instrument is BankInstrument | AchInstrument {
    return instrument?.type === 'bank';
}

export default function assertIsBankInstrument(
    instrument?: PaymentInstrument,
): asserts instrument is BankInstrument | AchInstrument {
    if (!instrument || !isBankAccountInstrument(instrument)) {
        throw new Error('Is not a bank account instrument.');
    }
}
