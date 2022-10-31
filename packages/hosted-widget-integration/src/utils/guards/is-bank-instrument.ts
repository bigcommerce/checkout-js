import { BankInstrument, PaymentInstrument } from '@bigcommerce/checkout-sdk';

export function isBankAccountInstrument(
    instrument?: PaymentInstrument,
): instrument is BankInstrument {
    return instrument !== undefined && instrument.type === 'bank';
}

export default function assertIsBankInstrument(
    instrument?: PaymentInstrument,
): asserts instrument is BankInstrument {
    if (!isBankAccountInstrument(instrument)) {
        throw new Error('Is not a bank account instrument.');
    }
}
