import { Address, FormField, LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { NumberSchema, object, string, StringSchema } from 'yup';

export enum BraintreeAchFieldType {
    BusinessName = 'businessName',
    AccountType = 'accountType',
    AccountNumber = 'accountNumber',
    RoutingNumber = 'routingNumber',
    OwnershipType = 'ownershipType',
}

export enum BraintreeAchAddressType {
    FirstName = 'firstName',
    LastName = 'lastName',
    Address1 = 'address1',
    Address2 = 'address2',
    PostalCode = 'postalCode',
    CountryCode = 'countryCode',
    City = 'city',
    StateOrProvinceCode = 'stateOrProvinceCode',
}

export const BraintreeAchBankAccountValues = {
    ...BraintreeAchFieldType,
    ...BraintreeAchAddressType
};

export type BraintreeAchBankAccount = BraintreeAchFieldType | BraintreeAchAddressType;

export const filterAddressToFormValues = (address?: Address) => {
    const addressValues: Partial<Address> = {};

    if (!address) return addressValues;

    const values = Object.values(BraintreeAchAddressType);

    values.forEach((key) => {
        const value = address[key];

        if (value !== undefined) {
            addressValues[key] = value;
        }
    })

    return addressValues;
}

export default memoize(function getBraintreeAchValidationSchema({
    formFieldData,
    language,
}: {
    formFieldData: FormField[];
    language: LanguageService;
}) {
    const requiredFieldErrorTranslationIds: { [fieldName: string]: string } = {
        [BraintreeAchBankAccountValues.FirstName]: 'address.first_name',
        [BraintreeAchBankAccountValues.LastName]: 'address.last_name',
        [BraintreeAchBankAccountValues.Address1]: 'address.address_line_1',
        [BraintreeAchBankAccountValues.Address2]: 'address.address_line_2',
        [BraintreeAchBankAccountValues.City]: 'address.city',
        [BraintreeAchBankAccountValues.StateOrProvinceCode]: 'address.state',
        [BraintreeAchBankAccountValues.PostalCode]: 'address.postal_code',
        [BraintreeAchBankAccountValues.AccountNumber]: 'payment.account_number',
        [BraintreeAchBankAccountValues.RoutingNumber]: 'payment.routing_number',
        [BraintreeAchBankAccountValues.BusinessName]: 'payment.business_name',
    };

    return object(formFieldData.reduce((schema, { id, required }) => {
        if (required) {
            if (requiredFieldErrorTranslationIds[id]) {
                schema[id] = string().required(language.translate(`${requiredFieldErrorTranslationIds[id]}_required_error`));
            }
        }

        return schema;
    }, {} as Record<string, StringSchema | NumberSchema>));
})
