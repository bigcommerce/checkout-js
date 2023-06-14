import { FormField, LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, string, StringSchema } from 'yup';

export enum BraintreeAchFieldType {
    BusinessName = 'businessName',
    AccountType = 'accountType',
    AccountNumber = 'accountNumber',
    RoutingNumber = 'routingNumber',
    OwnershipType = 'ownershipType',
    FirstName = 'firstName',
    LastName = 'lastName',
}

export default memoize(function getBraintreeAchValidationSchema({
    formFieldData,
    language,
}: {
    formFieldData: FormField[];
    language: LanguageService;
}) {
    const requiredFieldErrorTranslationIds: { [fieldName: string]: string } = {
        [BraintreeAchFieldType.FirstName]: 'address.first_name',
        [BraintreeAchFieldType.LastName]: 'address.last_name',
        [BraintreeAchFieldType.AccountNumber]: 'payment.errors.account_number',
        [BraintreeAchFieldType.RoutingNumber]: 'payment.errors.routing_number',
        [BraintreeAchFieldType.BusinessName]: 'payment.errors.business_name',
    };

    return object(
        formFieldData.reduce((schema, { id, required }) => {
            if (required) {
                if (requiredFieldErrorTranslationIds[id]) {
                    schema[id] = string().required(
                        language.translate(
                            `${requiredFieldErrorTranslationIds[id]}_required_error`,
                        ),
                    );

                    if (id === BraintreeAchFieldType.AccountNumber) {
                        schema[id] = schema[id].matches(
                            /^\d+$/,
                            language.translate('payment.errors.only_numbers_error', {
                                label: language.translate('payment.account_number_label'),
                            }),
                        );
                    }

                    if (id === BraintreeAchFieldType.RoutingNumber) {
                        schema[id] = schema[id]
                            .matches(
                                /^\d+$/,
                                language.translate('payment.errors.only_numbers_error', {
                                    label: language.translate('payment.account_routing_label'),
                                }),
                            )
                            .min(
                                8,
                                language.translate('customer.min_error', {
                                    label: language.translate('payment.account_routing_label'),
                                    min: 8,
                                }),
                            )
                            .max(
                                9,
                                language.translate('customer.max_error', {
                                    label: language.translate('payment.account_routing_label'),
                                    max: 9,
                                }),
                            );
                    }
                }
            }

            return schema;
        }, {} as { [key: string]: StringSchema }),
    );
});
