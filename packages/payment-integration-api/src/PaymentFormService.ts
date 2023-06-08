import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { ObjectSchema } from 'yup';

import PaymentFormValues from './PaymentFormValues';
import PaymentFormErrors from './PaymentFormErrors';

export default interface PaymentFormService {
    disableSubmit(method: PaymentMethod, disabled?: boolean): void;
    getFieldValue<T>(field: string): T | unknown;
    getFormValues(): PaymentFormValues;
    hidePaymentSubmitButton(method: PaymentMethod, hidden?: boolean): void;
    isSubmitted(): boolean;
    setFieldTouched<TField extends keyof PaymentFormValues>(field: TField, touched?: boolean): void;
    setFieldValue<TField extends keyof PaymentFormValues>(
        field: TField,
        value: PaymentFormValues[TField],
    ): void;
    setSubmit(method: PaymentMethod, fn: ((values: PaymentFormValues) => void) | null): void;
    setSubmitted(isSubmitted: boolean): void;
    setValidationSchema(
        method: PaymentMethod,
        schema: ObjectSchema<Partial<PaymentFormValues>> | null,
    ): void;
    submitForm(): void;
    validateForm(values?: PaymentFormValues): Promise<PaymentFormErrors>;
}
