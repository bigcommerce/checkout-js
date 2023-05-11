import React, {
    Dispatch,
    FunctionComponent,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, LoadingOverlay } from '@bigcommerce/checkout/ui';

import {
    BraintreeAchBankAccount,
    BraintreeAchBankAccountValues,
    getBraintreeAchValidationSchema,
} from '../../validation-schemas';
import { AchFormFields } from '../AchFormFields';

import { AccountTypes, formFieldData, OwnershipTypes } from './braintreeAchPaymentFormConfig';

export interface AddressKeyMap<T = string> {
    [fieldName: string]: T;
}

export interface BraintreeAchPaymentFormProps extends Omit<PaymentMethodProps, 'onUnhandledError'> {
    outstandingBalance?: number;
    storeName?: string;
    setCurrentMandateText: Dispatch<SetStateAction<string>>;
}

const BraintreeAchPaymentForm: FunctionComponent<BraintreeAchPaymentFormProps> = ({
    paymentForm: { getFieldValue, setFieldValue, setValidationSchema, isSubmitted, setSubmitted },
    outstandingBalance,
    storeName,
    checkoutState,
    method,
    language,
    setCurrentMandateText,
}) => {
    const [isShowMandateText, setIsShowMandateText] = useState(false);

    const ownershipTypeValue = getFieldValue('ownershipType');
    const routingNumberValue = getFieldValue('routingNumber');
    const accountNumberValue = getFieldValue('accountNumber');
    const firstNameValue = getFieldValue('firstName');
    const lastNameValue = getFieldValue('lastName');
    const businessNameValue = getFieldValue('businessName');
    const accountTypeValue = getFieldValue('accountType');

    const isBusiness = ownershipTypeValue === OwnershipTypes.Business;
    const isLoadingBillingCountries = checkoutState.statuses.isLoadingBillingCountries();
    const symbol = checkoutState.data.getCart()?.currency.symbol;

    const usCountry = checkoutState.data
        .getBillingCountries()
        ?.find((state) => state.code === 'US');

    const billingAddress = checkoutState.data.getBillingAddress();

    const provinceOptions = useMemo(
        () => usCountry?.subdivisions.map((state) => ({ value: state.code, label: state.name })),
        [usCountry],
    );

    const handleChange = useCallback(
        (fieldId: string) => (value: string) => {
            setFieldValue(fieldId, value);
        },
        [setFieldValue],
    );

    const setFormValues = useCallback(() => {
        if (!billingAddress) return;

        const formValues = {
            ownershipType: OwnershipTypes.Personal,
            accountType: AccountTypes.Savings,
            accountNumber: '',
            routingNumber: '',
            businessName: '',
            firstName: billingAddress.firstName || '',
            lastName: billingAddress.lastName || '',
            address1: billingAddress.address1 || '',
            address2: billingAddress.address2 || '',
            postalCode: billingAddress.postalCode || '',
            countryCode: billingAddress.countryCode || '',
            city: billingAddress.city || '',
            stateOrProvinceCode: billingAddress.stateOrProvinceCode || '',
        };

        for (const [key, value] of Object.entries(formValues)) {
            setFieldValue(key, value);
        }
    }, [billingAddress, setFieldValue]);

    useEffect(() => {
        setFormValues();
    }, [setFormValues]);

    const formData = useMemo(
        () =>
            formFieldData
                .filter(({ id }) =>
                    isBusiness
                        ? id !== BraintreeAchBankAccountValues.FirstName &&
                          id !== BraintreeAchBankAccountValues.LastName
                        : id !== BraintreeAchBankAccountValues.BusinessName,
                )
                .map((field) =>
                    field.name === BraintreeAchBankAccountValues.StateOrProvinceCode
                        ? {
                              ...field,
                              options: {
                                  items: provinceOptions,
                              },
                          }
                        : field,
                ),
        [provinceOptions, isBusiness],
    );

    const fieldDataByOwnershipType = useMemo(() => {
        const isPersonalType = ownershipTypeValue === OwnershipTypes.Personal;
        const exceptionFieldTypes: BraintreeAchBankAccount[] = [];

        if (isPersonalType) {
            exceptionFieldTypes.push(BraintreeAchBankAccountValues.BusinessName);
        } else {
            exceptionFieldTypes.push(
                BraintreeAchBankAccountValues.FirstName,
                BraintreeAchBankAccountValues.LastName,
            );
        }

        return formFieldData.filter(
            ({ id }) => !exceptionFieldTypes.includes(id as BraintreeAchBankAccount),
        );
    }, [ownershipTypeValue]);

    const validationSchema = useMemo(
        () =>
            getBraintreeAchValidationSchema({
                formFieldData: fieldDataByOwnershipType,
                language,
            }),
        [fieldDataByOwnershipType, language],
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

            setIsShowMandateText(
                Boolean(isValidRoutingNumber && isValidAccountNumber && isValidDepositoryName),
            );
        };

        void validate();
    }, [
        validationSchema,
        routingNumberValue,
        accountNumberValue,
        firstNameValue,
        lastNameValue,
        businessNameValue,
        isBusiness,
    ]);

    useEffect(() => {
        setValidationSchema(method, validationSchema);
    }, [validationSchema, method, setValidationSchema]);

    const mandateText = useMemo(() => {
        if (isShowMandateText && storeName && outstandingBalance) {
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
        isShowMandateText,
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
        setCurrentMandateText(mandateText);
    }, [mandateText, setCurrentMandateText]);

    return (
        <FormContext.Provider value={{ isSubmitted: isSubmitted(), setSubmitted }}>
            <LoadingOverlay hideContentWhenLoading isLoading={isLoadingBillingCountries}>
                <div className="checkout-ach-form">
                    <AchFormFields
                        fieldValues={formData}
                        handleChange={handleChange}
                        language={language}
                    />
                    {isShowMandateText && <div className="mandate-text">{mandateText}</div>}
                </div>
            </LoadingOverlay>
        </FormContext.Provider>
    );
};

export default BraintreeAchPaymentForm;
