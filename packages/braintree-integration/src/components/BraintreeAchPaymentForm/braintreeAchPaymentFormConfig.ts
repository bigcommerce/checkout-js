import { FormField } from '@bigcommerce/checkout-sdk';

import { DynamicFormFieldType } from '@bigcommerce/checkout/ui';

import { BraintreeAchBankAccountValues } from '../../validation-schemas';

export enum OwnershipTypes {
    Personal = 'Personal',
    Business = 'Business',
}

export enum AccountTypes {
    Savings = 'Savings',
    Checking = 'Checking',
}

const accountTypeOptions = [
    {
        value: AccountTypes.Savings,
        label: AccountTypes.Savings,
    },
    {
        value: AccountTypes.Checking,
        label: AccountTypes.Checking,
    },
];

const ownershipTypeOptions = [
    {
        value: OwnershipTypes.Personal,
        label: OwnershipTypes.Personal,
    },
    {
        value: OwnershipTypes.Business,
        label: OwnershipTypes.Business,
    },
];

export const formFieldData: FormField[] = [
    {
        name: BraintreeAchBankAccountValues.AccountType,
        custom: false,
        id: BraintreeAchBankAccountValues.AccountType,
        label: 'Account Type',
        required: true,
        fieldType: DynamicFormFieldType.DROPDOWM,
        options: {
            items: accountTypeOptions,
        },
    },
    {
        name: BraintreeAchBankAccountValues.AccountNumber,
        custom: false,
        id: BraintreeAchBankAccountValues.AccountNumber,
        label: 'Account Number',
        required: true,
        max: 9,
        min: 8,
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
        fieldType: DynamicFormFieldType.DROPDOWM,
        options: {
            items: ownershipTypeOptions,
        },
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
        fieldType: DynamicFormFieldType.DROPDOWM,
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
