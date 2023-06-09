import { LanguageService } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { ObjectSchema } from 'yup';

import { PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import { CheckboxFormField } from '@bigcommerce/checkout/ui';

import { BraintreeAchBankAccountValues } from '../../validation-schemas';

export interface MandateTextProps {
    getFieldValue: PaymentFormService['getFieldValue'];
    setFieldValue: PaymentFormService['setFieldValue'];
    storeName?: string;
    outstandingBalance?: number;
    symbol?: string;
    isBusiness: boolean;
    validationSchema: ObjectSchema<{ [p: string]: any }>;
    language: LanguageService;
    updateMandateText: (mandateText: string) => void;
    isInstrumentFeatureAvailable?: boolean;
    onOrderConsentChange: (orderConsent: boolean) => void;
}

const MandateText: FunctionComponent<MandateTextProps> = ({
    getFieldValue,
    storeName,
    outstandingBalance,
    symbol,
    isBusiness,
    validationSchema,
    language,
    updateMandateText,
    isInstrumentFeatureAvailable,
    onOrderConsentChange,
    setFieldValue,
}) => {
    const [shouldShowMandateText, setShouldShowMandateText] = useState(false);

    const routingNumberValue = String(
        getFieldValue<string>(BraintreeAchBankAccountValues.RoutingNumber),
    );
    const accountNumberValue = String(
        getFieldValue<string>(BraintreeAchBankAccountValues.AccountNumber),
    );
    const firstNameValue = String(getFieldValue<string>(BraintreeAchBankAccountValues.FirstName));
    const lastNameValue = String(getFieldValue<string>(BraintreeAchBankAccountValues.LastName));
    const businessNameValue = String(
        getFieldValue<string>(BraintreeAchBankAccountValues.BusinessName),
    );
    const accountTypeValue = String(
        getFieldValue<string>(BraintreeAchBankAccountValues.AccountType),
    );

    useEffect(() => {
        const validate = async () => {
            const [
                isValidAccountNumber,
                isValidRoutingNumber,
                isValidFirstName,
                isValidLastName,
                isValidBusinessName,
            ] = await Promise.all([
                await validationSchema.fields.accountNumber?.isValid(accountNumberValue),
                await validationSchema.fields.routingNumber?.isValid(routingNumberValue),
                await validationSchema.fields.firstName?.isValid(firstNameValue),
                await validationSchema.fields.lastName?.isValid(lastNameValue),
                await validationSchema.fields.businessName?.isValid(businessNameValue),
            ]);

            const isValidDepositoryName = isBusiness
                ? isValidBusinessName
                : isValidFirstName && isValidLastName;

            return isValidRoutingNumber && isValidAccountNumber && isValidDepositoryName;
        };

        void validate().then((isValid) => {
            setShouldShowMandateText(isValid);
        });
    }, [
        validationSchema,
        routingNumberValue,
        accountNumberValue,
        firstNameValue,
        lastNameValue,
        businessNameValue,
        isBusiness,
    ]);

    const mandateText = useMemo(() => {
        if (shouldShowMandateText && storeName && outstandingBalance) {
            return language.translate(
                isInstrumentFeatureAvailable
                    ? 'payment.braintreeach_vaulting_mandate_text'
                    : 'payment.braintreeach_mandate_text',
                {
                    storeName,
                    depositoryName: isBusiness
                        ? businessNameValue
                        : `${firstNameValue} ${lastNameValue}`,
                    routingNumber: routingNumberValue,
                    accountNumber: accountNumberValue,
                    outstandingBalance: `${symbol || ''}${outstandingBalance}`,
                    currentDate: new Date().toJSON().slice(0, 10),
                    accountType: accountTypeValue.toLowerCase(),
                },
            );
        }

        return '';
    }, [
        shouldShowMandateText,
        storeName,
        outstandingBalance,
        language,
        isBusiness,
        businessNameValue,
        firstNameValue,
        lastNameValue,
        routingNumberValue,
        accountNumberValue,
        symbol,
        accountTypeValue,
        isInstrumentFeatureAvailable,
    ]);

    useEffect(() => {
        updateMandateText(mandateText);
    }, [mandateText, updateMandateText]);

    useEffect(() => {
        onOrderConsentChange(!shouldShowMandateText);

        return () => {
            setFieldValue('orderConsent', false);
        };
    }, [onOrderConsentChange, setFieldValue, shouldShowMandateText]);

    return shouldShowMandateText ? (
        <div className="mandate-text" data-test="mandate-text">
            <CheckboxFormField
                labelContent={mandateText}
                name="orderConsent"
                onChange={onOrderConsentChange}
            />
        </div>
    ) : null;
};

export default MandateText;
