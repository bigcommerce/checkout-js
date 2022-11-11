export default interface PaymentFormValues {
    [key: string]: unknown;
    paymentProviderRadio: string; // TODO: Give this property a better name. We need to keep it for now because of legacy reasons.
    shouldSaveInstrument?: boolean;
    terms?: boolean;
}
