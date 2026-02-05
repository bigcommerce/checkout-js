import { type FormField } from '@bigcommerce/checkout-sdk';

export function reorderAddressFormFields(formFields: FormField[]): FormField[] {
    const COUNTRY_CODE_FIELD = 'countryCode';
    const COMPANY_NAME_FIELD = 'company';
    const PHONE_FIELD = 'phone';

    const countryCodeField = formFields.find((f) => f.name === COUNTRY_CODE_FIELD);
    const companyField = formFields.find((f) => f.name === COMPANY_NAME_FIELD);
    const phoneField = formFields.find((f) => f.name === PHONE_FIELD);
    const rest = formFields.filter(
        (f) => f.name !== COUNTRY_CODE_FIELD && f.name !== COMPANY_NAME_FIELD && f.name !== PHONE_FIELD,
    );

    return [
        ...(countryCodeField ? [countryCodeField] : []),
        ...(companyField ? [companyField] : []),
        ...rest,
        ...(phoneField ? [phoneField] : []),
    ];
}
