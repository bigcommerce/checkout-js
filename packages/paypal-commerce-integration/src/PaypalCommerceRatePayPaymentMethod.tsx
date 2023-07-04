import React, {FunctionComponent, useCallback, useEffect, useMemo, useRef} from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { DynamicFormField, DynamicFormFieldType } from "@bigcommerce/checkout/ui";
import { FormField } from '../../../../CHECKOUT_SDK_JS/checkout-sdk-js';
import getPaypalCommerceRatePayValidationSchema from './validation-schemas/getPaypalCommerceRatePayValidationSchema';

const formFieldData: FormField[] = [
    {
        name: 'ratepay_birth_date',
        custom: false,
        id: 'ratepay_birth_date',
        label: 'payment.ratepay.birth_date',
        required: false,
        fieldType: DynamicFormFieldType.DATE,
    },
    {
        name: 'ratepay_phone_country_code',
        custom: false,
        id: 'ratepay_phone_country_code',
        label: 'payment.ratepay.phone_country_code',
        required: true,
        fieldType: DynamicFormFieldType.TEXT,
        type: 'string',
        maxLength: 2,
    },
    {
        name: 'ratepay_phone_number',
        custom: false,
        id: 'ratepay_phone_number',
        label: 'payment.ratepay.phone_number',
        required: false,
        fieldType: DynamicFormFieldType.TEXT,
        maxLength: 9,
    }
];

const PaypalCommerceRatePayPaymentMethod: FunctionComponent<any> = ({
    method,
    checkoutService,
    paymentForm,
    onUnhandledError,
    paymentForm: {
        setFieldValue,
        setValidationSchema,
        setSubmitted,
    },
    language,
}) => {
    const fieldsValues = useRef({});
    const initializePayment = async () => {
        try {
            await checkoutService.initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
                paypalcommerceratepay: {
                    container: '#checkout-payment-continue',
                    legalTextContainer: 'legal-text-container',
                    getFieldsValues: () => fieldsValues.current,
                    onRenderButton: () => {
                        paymentForm.hidePaymentSubmitButton(method, true);
                    },
                    onError: (error: Error) => {
                        paymentForm.disableSubmit(method, true);
                        onUnhandledError(error);
                    },
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

    const handleChange = useCallback(
        (fieldId: string) => (value: string) => {
            setFieldValue(fieldId, value);
            updateFieldValues({
               [fieldId]: value
            });

        },
        [setFieldValue],
    );

    const updateFieldValues = (field: { [key: string]: unknown }) => {
        fieldsValues.current = {...fieldsValues.current, ...field};
    }

    const validationSchema = useMemo(() =>
        getPaypalCommerceRatePayValidationSchema({
            formFieldData,
            language,
        })
    , [language, formFieldData]);

    // const validationSchema = {};

    useEffect(() => {
        setSubmitted(false);
        setValidationSchema(method, validationSchema);
    }, [validationSchema, method, setValidationSchema, setSubmitted]);

    return <div style={{marginBottom:'20px'}}>
        { formFieldData.map((field) => {
              return  <DynamicFormField
                    extraClass={`dynamic-form-field--${field.id}`}
                    field={field}
                    key={field.id}
                    label={language.translate(field.label)}
                    onChange={handleChange(field.id)}
                />
            }
        )
    }
    </div>
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PaypalCommerceRatePayPaymentMethod,
    [{ gateway: 'paypalcommercealternativemethods', id:'ratepay' }],
);
