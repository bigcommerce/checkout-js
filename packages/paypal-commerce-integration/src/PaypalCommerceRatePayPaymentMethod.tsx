import React, {FunctionComponent, useCallback, useEffect} from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { DynamicFormField, DynamicFormFieldType } from "@bigcommerce/checkout/ui";
import { FormField } from "../../../../CHECKOUT_SDK_JS/checkout-sdk-js";


const dateOfBirth: FormField = {
    name: 'ratePay_dateOfBirth',
    custom: false,
    id: 'ratePay_dateOfBirth',
    label: 'Date of birth',
    required: true,
    fieldType: DynamicFormFieldType.DATE,
};

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
}) => {
    const initializePayment = async () => {
        try {
            await checkoutService.initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
                paypalcommerceratepay: {
                    container: '#checkout-payment-continue',
                    onRenderButton: () => {
                        paymentForm.hidePaymentSubmitButton(method, true);
                    },
                    submitForm: () => {
                        paymentForm.setSubmitted(true);
                        paymentForm.submitForm();
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
            console.log('HANDLE CHANGE');
            setFieldValue(fieldId, value);
        },
        [setFieldValue],
    );

    const validationSchema = {};

    useEffect(() => {
        setSubmitted(false);
        setValidationSchema(method, validationSchema);
    }, [validationSchema, method, setValidationSchema, setSubmitted]);

    return <div style={{marginBottom:'20px'}}>
        <DynamicFormField
             extraClass={`dynamic-form-field--${dateOfBirth.id}`}
             field={dateOfBirth}
             key={dateOfBirth.id}
             label={'Date of Birth'} // TODO: fix
             onChange={handleChange(dateOfBirth.id)}
    />
    </div>
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PaypalCommerceRatePayPaymentMethod,
    [{ gateway: 'paypalcommercealternativemethods', id:'ratepay' }],
);
