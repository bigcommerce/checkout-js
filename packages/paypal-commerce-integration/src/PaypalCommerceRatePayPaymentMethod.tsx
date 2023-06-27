import React, {FunctionComponent, useCallback, useEffect, useRef} from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { DynamicFormField, DynamicFormFieldType } from "@bigcommerce/checkout/ui";
import { FormField } from "../../../../CHECKOUT_SDK_JS/checkout-sdk-js";
// import getPaypalCommerceRatePayValidationSchema from './validation-schemas/getPaypalCommerceRatePayValidationSchema';

const birthDate: FormField = {
    name: 'ratepay_birth_date',
    custom: false,
    id: 'ratepay_birth_date',
    label: 'payment.ratepay.birth_date',
    required: true,
    fieldType: DynamicFormFieldType.DATE,
};

const phoneCountryCode: FormField = {
    name: 'ratepay_phone_country_code',
    custom: false,
    id: 'ratepay_phone_country_code',
    label: 'payment.ratepay.phone_country_code',
    required: true,
    fieldType: DynamicFormFieldType.TEXT,
    type: 'string',
    maxLength: 2,
    min: 2,
};

const phoneNumber: FormField = {
    name: 'ratepay_phone_number',
    custom: false,
    id: 'ratePay_phone_number',
    label: 'payment.ratepay.phone_number',
    required: true,
    fieldType: DynamicFormFieldType.TEXT,
    maxLength: 9,
    min: 9,
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
                    birthDateContainer: birthDate.name,
                    phoneCountryCodeContainer: phoneCountryCode.name,
                    phoneNumberContainer: phoneNumber.name,
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

    const updateFieldValues = (fields: any) => { // TODO: FIX
        fieldsValues.current = {...fieldsValues.current, ...fields};
    }

    // const validationSchema = useMemo(() => {
    //     return getPaypalCommerceRatePayValidationSchema({
    //         formFieldData: {},
    //         language,
    //     })
    // }, []);

    const validationSchema = {};

    useEffect(() => {
        setSubmitted(false);
        setValidationSchema(method, validationSchema);
    }, [validationSchema, method, setValidationSchema, setSubmitted]);

    return <div style={{marginBottom:'20px'}}>
        <DynamicFormField
             extraClass={`dynamic-form-field--${birthDate.id}`}
             field={birthDate}
             key={birthDate.id}
             label={language.translate(birthDate.label)}
             onChange={handleChange(birthDate.id)}
    />
        <DynamicFormField
            extraClass={`dynamic-form-field--${phoneCountryCode.id}`}
            field={phoneCountryCode}
            key={phoneCountryCode.id}
            label={language.translate(phoneCountryCode.label)}
            onChange={handleChange(phoneCountryCode.id)}
        />
        <DynamicFormField
            extraClass={`dynamic-form-field--${phoneNumber.id}`}
            field={phoneNumber}
            key={phoneNumber.id}
            label={language.translate(phoneNumber.label)}
            onChange={handleChange(phoneNumber.id)}
        />
    </div>
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PaypalCommerceRatePayPaymentMethod,
    [{ gateway: 'paypalcommercealternativemethods', id:'ratepay' }],
);
