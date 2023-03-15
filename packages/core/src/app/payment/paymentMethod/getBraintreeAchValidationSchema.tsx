import { FormField, LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, string, StringSchema } from 'yup';

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

                if (id === BraintreeAchFieldType.AccountNumber) {
                    schema[id] = schema[id]
                        .matches(/^\d+$/, language.translate('payment.only_numbers_error', { label: language.translate('payment.account_number_label') }))
                }

                if (id === BraintreeAchFieldType.RoutingNumber) {
                    schema[id] = schema[id]
                        .matches(/^\d+$/, language.translate('payment.only_numbers_error', { label: language.translate('payment.account_routing_label') }))
                        .min(8, language.translate('customer.min_error', { label: language.translate('payment.account_routing_label'), min: 8 }))
                        .max(9, language.translate('customer.max_error', { label: language.translate('payment.account_routing_label'), max: 9 }))
                }
            }
        }

        return schema;
    }, {} as { [key: string]: StringSchema }));
})
