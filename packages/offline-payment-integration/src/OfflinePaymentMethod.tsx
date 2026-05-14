import { createOfflinePaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/offline';
import React, { type FunctionComponent, useEffect } from 'react';

import {
    type PaymentMethodProps,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { BasicFormField, TextInput } from '@bigcommerce/checkout/ui';

interface OfflineFormField {
    name: string;
    id: string;
    required: boolean;
    type: string;
    fieldType: string;
}

const isOfflineFormFieldArray = (value: unknown): value is OfflineFormField[] =>
    Array.isArray(value);

const validateField = (value: string, field: OfflineFormField): string | undefined => {
    if (field.required && !value) {
        return `${field.name} is required`;
    }

    if (field.type === 'number' && value && !/^\d+$/.test(value)) {
        return `${field.name} must be a positive whole number`;
    }
};

const OfflinePaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    onUnhandledError,
}) => {
    useEffect(() => {
        const initializePayment = async () => {
            try {
                await checkoutService.initializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                    integrations: [createOfflinePaymentStrategy],
                });
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        void initializePayment();

        return () => {
            const deinitializePayment = async () => {
                try {
                    await checkoutService.deinitializePayment({
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });
                } catch (error) {
                    if (error instanceof Error) {
                        onUnhandledError(error);
                    }
                }
            };

            void deinitializePayment();
        };
    }, [checkoutService, method.gateway, method.id, onUnhandledError]);

    const rawFormFields: unknown = method.initializationData?.formFieldsData;
    const formFields = isOfflineFormFieldArray(rawFormFields) ? rawFormFields : [];

    if (!formFields.length) {
        return null;
    }

    return (
        <>
            {formFields.map((field) => (
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
};

export default toResolvableComponent(OfflinePaymentMethod, [
    {
        type: 'PAYMENT_TYPE_OFFLINE',
    },
]);
