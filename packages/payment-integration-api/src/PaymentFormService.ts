import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import { type ObjectSchema } from 'yup';

import type PaymentFormErrors from './PaymentFormErrors';
import type PaymentFormValues from './PaymentFormValues';

export default interface PaymentFormService {
    disableSubmit(method: PaymentMethod, disabled?: boolean): void;
    getFieldValue<T>(field: string): T | unknown;
    getFormValues(): PaymentFormValues;
    hidePaymentSubmitButton(method: PaymentMethod, hidden?: boolean): void;
    // Whether the billing address form rendered on the payment step (if any) passes
    // validation. Methods that render their own submit button should re-validate
    // when this changes. validateForm already fails while it's false.
    isBillingFormValid?(): boolean;
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
