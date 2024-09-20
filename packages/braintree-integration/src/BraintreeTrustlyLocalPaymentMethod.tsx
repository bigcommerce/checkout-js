import { FormField } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback, useEffect, useMemo } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { DynamicFormField, DynamicFormFieldType } from '@bigcommerce/checkout/ui';

import getBraintreeTrustlyValidationSchema from './validation-schemas/getBraintreeTrustlyValidationSchema';

const phoneField: FormField = {
    name: 'phoneNumber',
    custom: false,
    id: 'phoneNumber',
    label: 'payment.phone_number_label',
    required: true,
    fieldType: DynamicFormFieldType.TEXT,
};

const formFieldData: FormField[] = [phoneField];

const BraintreeTrustlyLocalPaymentMethod: FunctionComponent<any> = ({
    method,
    checkoutService,
    checkoutState,
    paymentForm: { setFieldValue, setValidationSchema },
    language,
    onUnhandledError,
}) => {
    const { phone } = checkoutState.data.getBillingAddress() || {};

    const initializePayment = async () => {
        try {
            await checkoutService.initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
                braintreelocalmethods: {
                    container: '#checkout-payment-continue',
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

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

    useEffect(() => {
        void initializePayment();

        return () => {
            void deinitializePayment();
        };
    }, []);

    useEffect(() => {
        setFieldValue('phoneNumber', phone);
    }, [phone]);

    const validationSchema = useMemo(
        () =>
            getBraintreeTrustlyValidationSchema({
                formFieldData,
                language,
            }),
        [language],
    );

    useEffect(() => {
        setValidationSchema(method, validationSchema);
    }, [validationSchema, method, setValidationSchema]);

    const handleChange = useCallback(
        (fieldId: string) => (value: string) => {
            setFieldValue(fieldId, value);
        },
        [setFieldValue],
    );

    return (
        <div style={{ marginBottom: '20px' }}>
            <DynamicFormField
                extraClass="dynamic-form-field--trustly"
                field={phoneField}
                key={phoneField.id}
                label={language.translate(phoneField.label)}
                onChange={handleChange(phoneField.id)}
            />
        </div>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeTrustlyLocalPaymentMethod,
    [{ gateway: 'braintreelocalmethods', id: 'trustly' }],
);
