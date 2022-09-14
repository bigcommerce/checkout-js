import { CustomerAccountRequestBody } from '@bigcommerce/checkout-sdk';

import { mapCustomFormFieldsFromFormValues } from '../formFields';

import { CreateAccountFormValues } from './getCreateCustomerValidationSchema';

export default function mapCreateAccountFromFormValues({
    acceptsMarketingEmails,
    customFields,
    ...values
}: CreateAccountFormValues): CustomerAccountRequestBody {
    return {
        ...values,
        acceptsMarketingEmails: acceptsMarketingEmails && acceptsMarketingEmails.length > 0,
        customFields: mapCustomFormFieldsFromFormValues(customFields),
    };
}
