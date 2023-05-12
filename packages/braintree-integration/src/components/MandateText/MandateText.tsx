import { LanguageService } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { ObjectSchema } from 'yup';

import { PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';

import { BraintreeAchBankAccountValues } from '../../validation-schemas';

export interface MandateTextProps {
    getFieldValue: PaymentFormService['getFieldValue'];
    storeName?: string;
    outstandingBalance?: number;
    symbol?: string;
    isBusiness: boolean;
    validationSchema: ObjectSchema<{ [p: string]: any }>;
    language: LanguageService;
    updateMandateText: (mandateText: string) => void;
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
}) => {
    const [shouldShowMandateText, setShouldShowMandateText] = useState(false);

    const routingNumberValue = getFieldValue(BraintreeAchBankAccountValues.RoutingNumber);
    const accountNumberValue = getFieldValue(BraintreeAchBankAccountValues.AccountNumber);
    const firstNameValue = getFieldValue(BraintreeAchBankAccountValues.FirstName);
    const lastNameValue = getFieldValue(BraintreeAchBankAccountValues.LastName);
    const businessNameValue = getFieldValue(BraintreeAchBankAccountValues.BusinessName);
    const accountTypeValue = getFieldValue(BraintreeAchBankAccountValues.AccountType);

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
            return language.translate('payment.braintreeach_mandate_text', {
                storeName,
                depositoryName: isBusiness
                    ? String(businessNameValue)
                    : `${String(firstNameValue)} ${String(lastNameValue)}`,
                routingNumber: String(routingNumberValue),
                accountNumber: String(accountNumberValue),
                outstandingBalance: `${symbol || ''}${outstandingBalance}`,
                currentDate: new Date().toJSON().slice(0, 10),
                accountType: String(accountTypeValue).toLowerCase(),
            });
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
    ]);

    useEffect(() => {
        updateMandateText(mandateText);
    }, [mandateText, updateMandateText]);

    return shouldShowMandateText ? <div className="mandate-text">{mandateText}</div> : null;
};

export default MandateText;
