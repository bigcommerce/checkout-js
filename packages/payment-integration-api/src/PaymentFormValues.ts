export default interface PaymentFormValues {
    [key: string]: unknown;
    paymentProviderRadio: string; // TODO: Give this property a better name. We need to keep it for now because of legacy reasons.
    // READ-ONLY channel for the STRIPE-1525 timing signal. Set by the Stripe
    // OCS/CS widget's `paymentMethodSelect` callback and consumed by
    // `Payment.tsx handleSubmit`. It is intentionally NOT mapped into the
    // submitted order body (see `mapToOrderRequestBody`).
    selectedSubMethodId?: string;
    shouldSaveInstrument?: boolean;
    terms?: boolean;
}
