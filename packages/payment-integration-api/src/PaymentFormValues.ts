export default interface PaymentFormValues {
    paymentProviderRadio: string; // TODO: Give this property a better name. We need to keep it for now because of legacy reasons.
    terms?: boolean;
    [key: string]: unknown;
}
