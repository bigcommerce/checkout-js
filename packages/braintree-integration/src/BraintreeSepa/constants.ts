import { FormField } from '@bigcommerce/checkout-sdk';

export enum BraintreeSepaFieldType {
    AccountHolderName = 'accountHolderName',
    Iban = 'braintreeIban',
}

export const braintreeSepaFormFields: FormField[] = [
    {
        name: BraintreeSepaFieldType.AccountHolderName,
        custom: false,
        id: BraintreeSepaFieldType.AccountHolderName,
        label: 'Name',
        required: true,
    },
    {
        name: BraintreeSepaFieldType.Iban,
        custom: false,
        id: BraintreeSepaFieldType.Iban,
        label: 'Iban',
        required: true,
    },
];
