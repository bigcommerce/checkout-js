import { Address, Country, FormField } from '@bigcommerce/checkout-sdk';
import React, { ComponentType, FunctionComponent, useCallback, useEffect, useMemo } from 'react';

import { CheckoutContextProps, withCheckout } from '../checkout';
import { connectFormik, ConnectFormikProps } from '../common/form';
import { EMPTY_ARRAY } from '../common/utility';
import { withLanguage, WithLanguageProps } from '../locale';
import DynamicFormFieldType from '../ui/form/DynamicFormFieldType';

import { BraintreeAchPaymentFormProps } from './paymentMethod/BraintreeAchPaymentForm';
import getBraintreeAchValidationSchema, {
    BraintreeAchBankAccount,
    BraintreeAchBankAccountValues
} from './paymentMethod/getBraintreeAchValidationSchema';
import withPayment, { WithPaymentProps } from './withPayment';

enum OwnershipTypes {
    Personal = 'Personal',
    Business = 'Business'
}

enum AccountTypes {
    Savings = 'Savings',
    Checking = 'Checking'
}

const accountTypeOptions = [{
    value: AccountTypes.Savings,
    label: AccountTypes.Savings
}, {
    value: AccountTypes.Checking,
    label: AccountTypes.Checking
}];

const ownershipTypeOptions = [{
    value: OwnershipTypes.Personal,
    label: OwnershipTypes.Personal
}, {
    value: OwnershipTypes.Business,
    label: OwnershipTypes.Business
}];

const formFieldData: FormField[] = [
    {
        name: BraintreeAchBankAccountValues.AccountType,
        custom: false,
        id: BraintreeAchBankAccountValues.AccountType,
        label: 'Account Type',
        required: true,
        fieldType: DynamicFormFieldType.dropdown,
        options: {
            items: accountTypeOptions
        },
    },
    {
        name: BraintreeAchBankAccountValues.AccountNumber,
        custom: false,
        id: BraintreeAchBankAccountValues.AccountNumber,
        label: 'Account Number',
        required: true,
        max: 9,
        min: 8
    },
    {
        name: BraintreeAchBankAccountValues.RoutingNumber,
        custom: false,
        id: BraintreeAchBankAccountValues.RoutingNumber,
        label: 'Routing Number',
        required: true,
    },
    {
        name: BraintreeAchBankAccountValues.OwnershipType,
        custom: false,
        id: BraintreeAchBankAccountValues.OwnershipType,
        label: 'Ownership Type',
        required: true,
        fieldType: DynamicFormFieldType.dropdown,
        options: {
            items: ownershipTypeOptions
        }
    },
    {
        name: BraintreeAchBankAccountValues.FirstName,
        custom: false,
        id: BraintreeAchBankAccountValues.FirstName,
        label: 'First Name',
        required: true,
    },
    {
        name: BraintreeAchBankAccountValues.LastName,
        custom: false,
        id: BraintreeAchBankAccountValues.LastName,
        label: 'Last Name',
        required: true,
    },
    {
        name: BraintreeAchBankAccountValues.BusinessName,
        custom: false,
        id: BraintreeAchBankAccountValues.BusinessName,
        label: 'Business Name',
        required: true,
    },
    {
        name: BraintreeAchBankAccountValues.Address1,
        custom: false,
        id: BraintreeAchBankAccountValues.Address1,
        label: 'Address',
        required: true,
    },
    {
        name: BraintreeAchBankAccountValues.Address2,
        custom: false,
        id: BraintreeAchBankAccountValues.Address2,
        label: 'Apartment/Suite/Building',
        required: false,
    },
    {
        name: BraintreeAchBankAccountValues.StateOrProvinceCode,
        custom: false,
        id: BraintreeAchBankAccountValues.StateOrProvinceCode,
        label: 'State/Province',
        required: true,
        fieldType: DynamicFormFieldType.dropdown,
    },
    {
        name: BraintreeAchBankAccountValues.City,
        custom: false,
        id: BraintreeAchBankAccountValues.City,
        label: 'City',
        required: true,
    },
    {
        name: BraintreeAchBankAccountValues.PostalCode,
        custom: false,
        id: BraintreeAchBankAccountValues.PostalCode,
        label: 'Postal Code',
        required: true,
    },
];

interface WithAchBraintreeFields {
    usCountry?: Country;
    billingAddress?: Address;
}

export default function withAchBraintreeFields<T extends object>(
    OriginalComponent: ComponentType<T>
) {
    const Component: FunctionComponent<
        WithAchBraintreeFields &
        BraintreeAchPaymentFormProps &
        ConnectFormikProps<{ [key: string]: string }> &
        WithPaymentProps &
        WithLanguageProps
    > = ({
        formik: {
            values: {
                ownershipType,
                ...values
            },
            setValues,
            setFieldValue,
        },
        usCountry,
        setValidationSchema,
        language,
        billingAddress,
        method,
        isLoadingBillingCountries,
        initializePayment,
        initializeBillingAddressFields,
        mandateText,
        ...rest
    }) => {
        const isBusiness = ownershipType === OwnershipTypes.Business;

        useEffect(() => {
            if (!billingAddress) return;

            setValues({
                ...values,
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
            })
        }, [setValues, billingAddress]);

        const provinceOptions = useMemo(() => (
            usCountry?.subdivisions.map((state) => ({ value: state.code, label: state.name }))
        ), [usCountry]);

        const formData = useMemo(() => (
            formFieldData
                .filter(({ id }) => (
                    isBusiness ? id !== BraintreeAchBankAccountValues.FirstName && id !== BraintreeAchBankAccountValues.LastName : id !== BraintreeAchBankAccountValues.BusinessName
                ))
                .map((field) => (
                    field.name === BraintreeAchBankAccountValues.StateOrProvinceCode ? {
                        ...field,
                        options: {
                            items: provinceOptions
                        }
                    } : field
                ))
        ), [provinceOptions, isBusiness]);

        const handleChange = useCallback((fieldId: string) => (value: string) => {
            setFieldValue(fieldId, value);
        }, [setFieldValue]);

        const fieldDataByOwnershipType = useMemo(() => {
            const isPersonalType = ownershipType === OwnershipTypes.Personal;
            const exceptionFieldTypes: BraintreeAchBankAccount[] = [];

            if (isPersonalType) {
                exceptionFieldTypes.push(BraintreeAchBankAccountValues.BusinessName);
            } else {
                exceptionFieldTypes.push(BraintreeAchBankAccountValues.FirstName, BraintreeAchBankAccountValues.LastName);
            }

            return formFieldData.filter(({ id }) => (
                !exceptionFieldTypes.includes(id as BraintreeAchBankAccount)
            ))
        }, [ownershipType, formFieldData]);

        useEffect(() => {
            setValidationSchema(method, getBraintreeAchValidationSchema({
                formFieldData: fieldDataByOwnershipType,
                language,
            }));
        }, [setValidationSchema, method, language, fieldDataByOwnershipType]);

        return (
            <OriginalComponent
                {...(rest as T)}
                fieldValues={formData}
                handleChange={handleChange}
                initializeBillingAddressFields={initializeBillingAddressFields}
                initializePayment={initializePayment}
                isLoadingBillingCountries={isLoadingBillingCountries}
                mandateText={mandateText}
                method={method}
            />
        )
    }

    return connectFormik(withLanguage(
        withPayment(
            withCheckout(mapFromCheckoutProps)(Component)
        )
    ))
}

const mapFromCheckoutProps = ({ checkoutState, checkoutService }: CheckoutContextProps) => {
    const {
        data: {
            getBillingCountries,
            getBillingAddress
        },
        statuses: {
            isInitializingPayment,
            isLoadingBillingCountries
        },
    } = checkoutState;

    const { loadBillingAddressFields } = checkoutService;

    const countries = getBillingCountries() || EMPTY_ARRAY;
    const billingAddress = getBillingAddress();

    const usCountry = countries.find((state) => state.code === 'US');

    return {
        billingAddress,
        initializeBillingAddressFields: loadBillingAddressFields,
        usCountry,
        isInitializingPayment,
        isLoadingBillingCountries: isLoadingBillingCountries()
    }
}
