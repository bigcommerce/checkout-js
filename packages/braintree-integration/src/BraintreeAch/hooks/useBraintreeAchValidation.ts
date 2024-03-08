import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { useCallback, useEffect } from 'react';
import { object, string, StringSchema } from 'yup';

import { useLocale } from '@bigcommerce/checkout/locale';
import {
    PaymentFormValues,
    usePaymentFormContext,
} from '@bigcommerce/checkout/payment-integration-api';

import {
    BraintreeAchFieldType,
    businessBraintreeAchFormFields,
    OwnershipTypes,
    personalBraintreeAchFormFields,
} from '../constants';

const useBraintreeAchValidation = (method: PaymentMethod) => {
    const { paymentForm } = usePaymentFormContext();
    const { language } = useLocale();

    const getValidationSchema = () => {
        const ownershipType = paymentForm.getFieldValue('ownershipType');
        const formFields =
            ownershipType === OwnershipTypes.Business
                ? businessBraintreeAchFormFields
                : personalBraintreeAchFormFields;

        const requiredFieldErrorTranslationIds: { [fieldName: string]: string } = {
            [BraintreeAchFieldType.FirstName]: 'address.first_name',
            [BraintreeAchFieldType.LastName]: 'address.last_name',
            [BraintreeAchFieldType.AccountNumber]: 'payment.errors.account_number',
            [BraintreeAchFieldType.RoutingNumber]: 'payment.errors.routing_number',
            [BraintreeAchFieldType.BusinessName]: 'payment.errors.business_name',
        };

        return object(
            formFields.reduce((schema, { id, required }) => {
                if (required) {
                    if (requiredFieldErrorTranslationIds[id]) {
                        schema[id] = string().required(
                            language.translate(
                                `${requiredFieldErrorTranslationIds[id]}_required_error`,
                            ),
                        );

                        if (id === BraintreeAchFieldType.AccountNumber) {
                            schema[id] = schema[id].matches(
                                /^\d+$/,
                                language.translate('payment.errors.only_numbers_error', {
                                    label: language.translate('payment.account_number_label'),
                                }),
                            );
                        }

                        if (id === BraintreeAchFieldType.RoutingNumber) {
                            schema[id] = schema[id]
                                .matches(
                                    /^\d+$/,
                                    language.translate('payment.errors.only_numbers_error', {
                                        label: language.translate('payment.account_routing_label'),
                                    }),
                                )
                                .min(
                                    8,
                                    language.translate('customer.min_error', {
                                        label: language.translate('payment.account_routing_label'),
                                        min: 8,
                                    }),
                                )
                                .max(
                                    9,
                                    language.translate('customer.max_error', {
                                        label: language.translate('payment.account_routing_label'),
                                        max: 9,
                                    }),
                                );
                        }
                    }
                }

                return schema;
            }, {} as { [key: string]: StringSchema }),
        );
    };

    const validateBraintreeAchForm = useCallback(
        async (braintreeAchFormValues: PaymentFormValues): Promise<boolean> => {
            const {
                accountNumber,
                businessName,
                routingNumber,
                ownershipType,
                firstName,
                lastName,
            } = braintreeAchFormValues;

            const validationSchema = getValidationSchema();

            const [
                isValidAccountNumber,
                isValidRoutingNumber,
                isValidFirstName,
                isValidLastName,
                isValidBusinessName,
            ] = await Promise.all([
                await validationSchema.fields.accountNumber?.isValid(accountNumber),
                await validationSchema.fields.routingNumber?.isValid(routingNumber),
                await validationSchema.fields.firstName?.isValid(firstName),
                await validationSchema.fields.lastName?.isValid(lastName),
                await validationSchema.fields.businessName?.isValid(businessName),
            ]);

            const isValidDepositoryName =
                ownershipType === OwnershipTypes.Business
                    ? isValidBusinessName
                    : isValidFirstName && isValidLastName;

            return isValidRoutingNumber && isValidAccountNumber && isValidDepositoryName;
        },
        [getValidationSchema],
    );

    useEffect(() => {
        paymentForm.setValidationSchema(method, getValidationSchema());
    }, [method, paymentForm, getValidationSchema]);

    return {
        validateBraintreeAchForm,
    };
};

export default useBraintreeAchValidation;
