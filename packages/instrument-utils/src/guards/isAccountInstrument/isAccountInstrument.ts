import { AccountInstrument, PaymentInstrument } from '@bigcommerce/checkout-sdk';

export default function isAccountInstrument(
    instrument: PaymentInstrument,
): instrument is AccountInstrument {
    return instrument.type === 'account';
}
