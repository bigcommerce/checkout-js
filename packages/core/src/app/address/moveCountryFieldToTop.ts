import { type FormField } from '@bigcommerce/checkout-sdk';

const COUNTRY_FIELD_NAME = 'countryCode';

export function moveCountryFieldToTop(formFields: FormField[]): FormField[] {
    const countryFieldIndex = formFields.findIndex((field) => field.name === COUNTRY_FIELD_NAME);

    if (countryFieldIndex <= 0) {
        return formFields;
    }

    return [
        formFields[countryFieldIndex],
        ...formFields.filter((_, index) => index !== countryFieldIndex),
    ];
}
