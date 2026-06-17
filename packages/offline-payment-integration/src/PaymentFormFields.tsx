import React, { type FunctionComponent } from 'react';

import {
    getPaymentFormFields,
    type PaymentFormField,
} from '@bigcommerce/checkout/payment-integration-api';
import { BasicFormField, TextInput } from '@bigcommerce/checkout/ui';

export { getPaymentFormFields, type PaymentFormField };

const validateField = (value: string, field: PaymentFormField): string | undefined => {
    if (field.required && !value) {
        return `${field.name} is required`;
    }

    if (field.type === 'number' && value && !/^\d+$/.test(value)) {
        return `${field.name} must be a positive whole number`;
    }
};

const PaymentFormFields: FunctionComponent<{ fields: PaymentFormField[] }> = ({ fields }) => (
    <>
        {fields.map((field) => (
            <BasicFormField
                key={field.id}
                name={field.id}
                render={({ field: fieldProps, meta }) => (
                    <div style={{ paddingBottom: '1rem' }}>
                        <label htmlFor={field.id}>{field.name}</label>
                        <TextInput
                            {...fieldProps}
                            id={field.id}
                            inputMode={field.type === 'number' ? 'numeric' : undefined}
                            onChange={
                                field.type === 'number'
                                    ? (e) => {
                                          e.target.value = e.target.value.replace(/\D/g, '');
                                          fieldProps.onChange(e);
                                      }
                                    : fieldProps.onChange
                            }
                            type="text"
                        />
                        {meta.touched && meta.error ? (
                            <p className="form-field-error-message">{meta.error}</p>
                        ) : null}
                    </div>
                )}
                validate={(value: string) => validateField(value, field)}
            />
        ))}
    </>
);

export default PaymentFormFields;
