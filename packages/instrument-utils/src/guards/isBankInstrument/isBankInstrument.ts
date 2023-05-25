import {
    BankInstrument,
    BraintreeAchInstrument,
    PaymentInstrument,
} from '@bigcommerce/checkout-sdk';

export function isBankAccountInstrument(
    instrument?: PaymentInstrument,
): instrument is BankInstrument | BraintreeAchInstrument {
    return instrument?.type === 'bank';
}

export default function assertIsBankInstrument(
    instrument?: PaymentInstrument,
): asserts instrument is BankInstrument | BraintreeAchInstrument {
    if (!instrument || !isBankAccountInstrument(instrument)) {
        throw new Error('Is not a bank account instrument.');
    }
}
