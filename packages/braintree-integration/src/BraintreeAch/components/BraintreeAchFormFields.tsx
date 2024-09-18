import { LanguageService } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback } from 'react';

import { useLocale } from '@bigcommerce/checkout/locale';
import { usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';
import { DynamicFormField } from '@bigcommerce/checkout/ui';

import {
    BraintreeAchFieldType,
    businessBraintreeAchFormFields,
    OwnershipTypes,
    personalBraintreeAchFormFields,
} from '../constants';

const isBraintreeAchFormFieldName = (fieldName: string): fieldName is BraintreeAchFieldType => {
    return Object.values(BraintreeAchFieldType).includes(fieldName as BraintreeAchFieldType);
};

const getTranslatedLabelByFieldName = (fieldName: string, language: LanguageService) => {
    const braintreeAchFormLabelsMap = {
        firstName: language.translate('address.first_name_label'),
        lastName: language.translate('address.last_name_label'),
        accountNumber: language.translate('payment.account_number_label'),
        routingNumber: language.translate('payment.account_routing_label'),
        businessName: language.translate('payment.business_name_label'),
        ownershipType: language.translate('payment.ownership_type_label'),
        accountType: language.translate('payment.account_type_label'),
    };

    return isBraintreeAchFormFieldName(fieldName)
        ? braintreeAchFormLabelsMap[fieldName]
        : fieldName;
};

const BraintreeAchFormFields: FunctionComponent = () => {
    const { language } = useLocale();
    const { paymentForm } = usePaymentFormContext();
    const { getFieldValue, setFieldValue } = paymentForm;

    const ownershipTypeValue = getFieldValue(BraintreeAchFieldType.OwnershipType);
    const fieldValues =
        ownershipTypeValue === OwnershipTypes.Business
            ? businessBraintreeAchFormFields
            : personalBraintreeAchFormFields;

    const handleChange = useCallback(
        (fieldId: string) => (value: string) => {
            setFieldValue(fieldId, value);
        },
        [setFieldValue],
    );

    return (
        <>
            {fieldValues.map((field) => (
                <DynamicFormField
                    extraClass={`dynamic-form-field--${field.id}`}
                    field={field}
                    key={field.id}
                    label={getTranslatedLabelByFieldName(field.name, language)}
                    onChange={handleChange(field.id)}
                />
            ))}
        </>
    );
};

export default BraintreeAchFormFields;
