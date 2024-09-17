import { BankInstrument, PaymentInstrument } from '@bigcommerce/checkout-sdk';

export function isBankAccountInstrument(
    instrument?: PaymentInstrument,
): instrument is BankInstrument {
    return (
        instrument?.type === 'bank' && instrument?.method !== 'ach' && instrument?.method !== 'ecp'
    );
}

export default function assertIsBankInstrument(
    instrument?: PaymentInstrument,
): asserts instrument is BankInstrument {
    if (!instrument || !isBankAccountInstrument(instrument)) {
        throw new Error('Is not a bank account instrument.');
    }
}
