import {
    CardInstrument,
    CheckoutSelectors, Country, FormField,
    PaymentInitializeOptions,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback, useEffect, useMemo } from 'react';

import { AddressKeyMap } from '../../address/address';
import { CheckoutContextProps, withCheckout } from '../../checkout';
import { connectFormik, ConnectFormikProps } from '../../common/form';
import { EMPTY_ARRAY } from '../../common/utility';
import { TranslatedString, withLanguage, WithLanguageProps } from '../../locale';
import { DynamicFormField } from '../../ui/form';
import DynamicFormFieldType from '../../ui/form/DynamicFormFieldType';
import { LoadingOverlay } from '../../ui/loading';
import withPayment, { WithPaymentProps } from '../withPayment';

import getBraintreeAchValidationSchema, { BraintreeAchBankAccount, BraintreeAchBankAccountValues } from './getBraintreeAchValidationSchema';

const LABEL: AddressKeyMap = {
    address1: 'address.address_line_1_label',
    address2: 'address.address_line_2_label',
    city: 'address.city_label',
    countryCode: 'address.country_label',
    firstName: 'address.first_name_label',
    lastName: 'address.last_name_label',
    postalCode: 'address.postal_code_label',
    stateOrProvinceCode: 'address.state_label',
    accountNumber: 'payment.account_number_label',
    routingNumber: 'payment.routing_number_label',
    businessName: 'payment.business_name_label',
    ownershipType: 'payment.ownership_type_label',
    accountType: 'payment.account_type_label'
};

export enum OwnershipTypes {
    Personal = 'Personal',
    Business = 'Business'
}

export enum AccountTypes {
    Savings = 'Savings',
    Checking = 'Checking'
}

export const accountTypeOptions = [{
    value: AccountTypes.Savings,
    label: AccountTypes.Savings
}, {
    value: AccountTypes.Checking,
    label: AccountTypes.Checking
}];

export const ownershipTypeOptions = [{
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

export interface AchFormFieldsProps {
    ownershipType: string;
    handleChange: (fieldId: string) => (value: string) => void;
    provinceOptions?: Array<{ value: string; label: string }>
}

const AchFormFields: FunctionComponent<AchFormFieldsProps> = ({
    ownershipType,
    handleChange,
    provinceOptions,
}) => {
    const isBusiness = useMemo(() => ownershipType === OwnershipTypes.Business, [ownershipType]);

    return (
        <>
            {useMemo(() => (
                formFieldData.filter(({ id }) => (
                    isBusiness ? id !== BraintreeAchBankAccountValues.FirstName && id !== BraintreeAchBankAccountValues.LastName : id !== BraintreeAchBankAccountValues.BusinessName
                )).map((field) => (
                    <DynamicFormField
                        extraClass={`dynamic-form-field--${field.id ?? field.name}`}
                        field={field.name === BraintreeAchBankAccountValues.StateOrProvinceCode ? {
                            ...field,
                            options: {
                                items: provinceOptions
                            }
                        } : field}
                        key={field.id}
                        label={<TranslatedString id={LABEL[field.name]} />}
                        onChange={handleChange(field.id)}
                        useFloatingLabel
                    />
                ))
            ), [isBusiness, handleChange, provinceOptions])}
        </>
    );
}

export interface BraintreeAchPaymentFormProps {
    method: PaymentMethod;
    initializePayment(
        options: PaymentInitializeOptions,
        selectedInstrument?: CardInstrument,
    ): Promise<CheckoutSelectors>;
    mandateText: string;
    usCountry?: Country;
    isLoadingBillingCountries: boolean;
    initializeBillingAddressFields(): Promise<CheckoutSelectors>;
}

const keypressHandler = (evt: KeyboardEvent) => {
    const pattern = /^\d+\.?\d*$/;
    const isValid = pattern.test(evt.key);

    if (!isValid) {
        evt.preventDefault();
    }
};

const BraintreeAchPaymentForm: FunctionComponent<
    BraintreeAchPaymentFormProps &
    ConnectFormikProps<{ [key: string]: string }> &
    WithPaymentProps &
    WithLanguageProps
> = ({
    formik: {
        values: {
            ownershipType,
        },
        setFieldValue,
    },
    setValidationSchema,
    language,
    mandateText,
    usCountry,
    isLoadingBillingCountries,
    ...props
}): any => {
    useEffect(() => {
        const {
            method: {
                gateway: gatewayId,
                id: methodId
            },
            initializePayment,
            initializeBillingAddressFields
        } = props;

        const initialize = async () => {
            await initializeBillingAddressFields();

            await initializePayment({
                gatewayId,
                methodId,
            });
        }

        initialize();
    }, []);

    useEffect(() => {
        document.getElementById(BraintreeAchBankAccountValues.AccountNumber)?.addEventListener('keypress', keypressHandler);
        document.getElementById(BraintreeAchBankAccountValues.RoutingNumber)?.addEventListener('keypress', keypressHandler);


        return () => {
            document.getElementById(BraintreeAchBankAccountValues.AccountNumber)?.removeEventListener('keypress', keypressHandler);
            document.getElementById(BraintreeAchBankAccountValues.RoutingNumber)?.addEventListener('keypress', keypressHandler);
        }
    });

    const provinceOptions = useMemo(() => (
        usCountry?.subdivisions.map((state) => ({ value: state.code, label: state.name }))
    ), [usCountry]);

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
        setValidationSchema(props.method, getBraintreeAchValidationSchema({
            formFieldData: fieldDataByOwnershipType,
            language,
        }));
    }, [setValidationSchema, props.method, language, fieldDataByOwnershipType]);

    const handleChange = useCallback((fieldId: string) => (value: string) => {
        setFieldValue(fieldId, value);
    }, [setFieldValue]);

    return (
        <LoadingOverlay
            hideContentWhenLoading
            isLoading={isLoadingBillingCountries}
        >
            <div className='checkout-ach-form'>
                <AchFormFields
                    handleChange={handleChange}
                    ownershipType={ownershipType}
                    provinceOptions={provinceOptions}
                />
                <div className='checkout-ach-form--mandate-text'>
                    {mandateText}
                </div>
            </div>
        </LoadingOverlay>
    )
}

const mapFromCheckoutProps = ({ checkoutState, checkoutService }: CheckoutContextProps) => {
    const {
        data: {
            getBillingCountries,
        },
        statuses: {
            isInitializingPayment,
            isLoadingBillingCountries
        },
    } = checkoutState;

    const { loadBillingAddressFields } = checkoutService;

    const countries = getBillingCountries() || EMPTY_ARRAY;

    const usCountry = countries.find((state) => state.code === 'US');

    return {
        initializeBillingAddressFields: loadBillingAddressFields,
        usCountry,
        isInitializingPayment,
        isLoadingBillingCountries: isLoadingBillingCountries()
    }
}

export default connectFormik(
    withLanguage(
        withPayment(
            withCheckout(mapFromCheckoutProps)(BraintreeAchPaymentForm)
        )
    )
);
