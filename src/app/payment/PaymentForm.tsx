
import { CreditCardFieldsetValues } from './creditCard';
import { InstrumentFieldsetValues } from './storedInstrument';

export type PaymentFormValues = (
    CreditCardFieldsetValues & PaymentFormCommonValues |
    InstrumentFieldsetValues & PaymentFormCommonValues |
    HostedWidgetPaymentMethodValues & PaymentFormCommonValues |
    PaymentFormCommonValues
);

export interface PaymentFormCommonValues {
    paymentProviderRadio: string; // TODO: Give this property a better name. We need to keep it for now because of legacy reasons.
    terms?: boolean;
    useStoreCredit?: boolean;
}

export interface HostedWidgetPaymentMethodValues {
    shouldSaveInstrument: boolean;
}
