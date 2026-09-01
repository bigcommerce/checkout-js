export interface PaymentFormField {
    name: string;
    id: string;
    required: boolean;
    type: string;
    fieldType: string;
}

const isPaymentFormFieldArray = (value: unknown): value is PaymentFormField[] =>
    Array.isArray(value);

export const getPaymentFormFields = (formFieldsData: unknown): PaymentFormField[] =>
    isPaymentFormFieldArray(formFieldsData) ? formFieldsData : [];
