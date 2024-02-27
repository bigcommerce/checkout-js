import { BankInstrument, PaymentInstrument } from '@bigcommerce/checkout-sdk';

export function isSepaInstrument(instrument?: PaymentInstrument): instrument is BankInstrument {
    return (
        instrument?.type === 'bank' &&
        (instrument?.method === 'sepa' || instrument?.method === 'sepa_direct_debit')
    );
}
