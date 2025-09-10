import { type FormField } from '@bigcommerce/checkout-sdk';
import { createPayPalCommerceRatePayPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/paypal-commerce';
import React, { type FunctionComponent, useCallback, useEffect, useMemo, useRef } from 'react';

import {
    type CountryData,
    CustomError,
    getCountryData,
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    type SpecificError,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { DynamicFormField, DynamicFormFieldType, FormContext } from '@bigcommerce/checkout/ui';

import getPaypalCommerceRatePayValidationSchema from './validation-schema/getPaypalCommerceRatePayValidationSchema';

const PAYMENT_SOURCE_INFO_CANNOT_BE_VERIFIED = 'PAYMENT_SOURCE_INFO_CANNOT_BE_VERIFIED';
const PAYMENT_SOURCE_DECLINED_BY_PROCESSOR = 'PAYMENT_SOURCE_DECLINED_BY_PROCESSOR';
const ITEM_CATEGORY_NOT_SUPPORTED_BY_PAYMENT_SOURCE =
    'ITEM_CATEGORY_NOT_SUPPORTED_BY_PAYMENT_SOURCE';

interface RatePayFieldValues {
    ratepayBirthDate: {
        getDate(): number;
        getMonth(): number;
        getFullYear(): number;
    };
    ratepayPhoneCountryCode: string;
    ratepayPhoneNumber: string;
}

const formFieldData: FormField[] = [
    {
        name: 'ratepayBirthDate',
        custom: false,
        id: 'ratepayBirthDate',
        label: 'payment.ratepay.birth_date',
        required: true,
        fieldType: DynamicFormFieldType.DATE,
        inputDateFormat: 'dd.MM.yyyy',
    },
    {
        name: 'ratepayPhoneCountryCode',
        custom: false,
        id: 'ratepayPhoneCountryCode',
        label: 'payment.ratepay.phone_country_code',
        required: true,
        fieldType: DynamicFormFieldType.TEXT,
        type: 'string',
    },
    {
        name: 'ratepayPhoneNumber',
        custom: false,
        id: 'ratepayPhoneNumber',
        label: 'payment.ratepay.phone_number',
        required: true,
        fieldType: DynamicFormFieldType.TEXT,
    },
];

const PaypalCommerceRatePayPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    onUnhandledError,
    paymentForm: { isSubmitted, setFieldValue, setValidationSchema, setSubmitted },
    language,
    checkoutState,
}) => {
    const fieldsValues = useRef<Partial<RatePayFieldValues>>({});
    const isPaymentDataRequired = checkoutState.data.isPaymentDataRequired();

    const getCountryInfo = (): CountryData | undefined => {
        const billing = checkoutState.data.getBillingAddress();

        if (billing && !billing.country) {
            return getCountryData(billing.country)[0];
        }
    };

    const initializePayment = async () => {
        try {
            await checkoutService.initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
                integrations: [createPayPalCommerceRatePayPaymentStrategy],
                paypalcommerceratepay: {
                    container: '#checkout-payment-continue',
                    legalTextContainer: 'legal-text-container',
                    loadingContainerId: 'checkout-page-container',
                    getFieldsValues: () => {
                        // TODO: update PPCP Ratepay initialization data with getFieldsValues optional return data in checkout-sdk
                        const defaultFieldValues = {
                            ratepayBirthDate: {
                                getDate: () => 0,
                                getMonth: () => 0,
                                getFullYear: () => 0,
                            },
                            ratepayPhoneCountryCode: '',
                            ratepayPhoneNumber: '',
                        };

                        return {
                            ...defaultFieldValues,
                            ...fieldsValues.current,
                        };
                    },
                    onError: (error: SpecificError) => {
                        const ratepaySpecificError = error.errors?.filter((e) => e.provider_error);

                        if (ratepaySpecificError?.length) {
                            let translationCode;
                            let ratepayError;
                            const ratepaySpecificErrorCode =
                                ratepaySpecificError[0].provider_error?.code;

                            switch (ratepaySpecificErrorCode) {
                                case PAYMENT_SOURCE_DECLINED_BY_PROCESSOR:
                                    translationCode =
                                        'payment.ratepay.errors.paymentSourceDeclinedByProcessor';
                                    break;

                                case PAYMENT_SOURCE_INFO_CANNOT_BE_VERIFIED:
                                    translationCode =
                                        'payment.ratepay.errors.paymentSourceInfoCannotBeVerified';
                                    break;

                                case ITEM_CATEGORY_NOT_SUPPORTED_BY_PAYMENT_SOURCE:
                                    translationCode =
                                        'payment.ratepay.errors.itemCategoryNotSupportedByPaymentSource';
                                    break;

                                default:
                                    translationCode = 'common.error_heading';
                            }

                            if (
                                ratepaySpecificErrorCode !==
                                ITEM_CATEGORY_NOT_SUPPORTED_BY_PAYMENT_SOURCE
                            ) {
                                ratepayError = new CustomError({
                                    data: {
                                        shouldBeTranslatedAsHtml: true,
                                        translationKey: translationCode,
                                    },
                                });
                            } else {
                                ratepayError = new Error(language.translate(translationCode));
                            }

                            return onUnhandledError(ratepayError);
                        }

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

    const updateFieldValues = (field: { [key: string]: string }): void => {
        fieldsValues.current = { ...fieldsValues.current, ...field };
    };

    const handleChange = useCallback(
        (fieldId: string) => (value: string) => {
            setFieldValue(fieldId, value);
            updateFieldValues({ [fieldId]: value });
        },
        [setFieldValue],
    );

    const validationSchema = useMemo(
        () =>
            getPaypalCommerceRatePayValidationSchema({
                formFieldData,
                language,
            }),
        [language, formFieldData],
    );

    useEffect(() => {
        setSubmitted(false);
        setValidationSchema(method, validationSchema);
    }, [validationSchema, method, setValidationSchema, setSubmitted]);

    useEffect(() => {
        const countryInfo = getCountryInfo();

        if (countryInfo) {
            setFieldValue('ratepayPhoneCountryCode', countryInfo.dialCode);
        }
    }, []);

    if (!isPaymentDataRequired) {
        return null;
    }

    const formContextProps = {
        isSubmitted: isSubmitted(),
        setSubmitted,
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <FormContext.Provider value={formContextProps}>
                {formFieldData.map((field) => {
                    return (
                        <DynamicFormField
                            extraClass={`dynamic-form-field--${field.id}`}
                            field={field}
                            key={field.id}
                            label={language.translate(field.label)}
                            onChange={handleChange(field.id)}
                        />
                    );
                })}
            </FormContext.Provider>
        </div>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PaypalCommerceRatePayPaymentMethod,
    [{ gateway: 'paypalcommercealternativemethods', id: 'ratepay' }],
);
