import { Address } from '@bigcommerce/checkout-sdk';
import { forIn, isDate } from 'lodash';

import { AddressFormValues } from './mapAddressToFormValues';

export default function mapAddressFromFormValues(formValues: AddressFormValues): Address {
    const { customFields: customFieldsObject, ...address } = formValues;
    const customFields: Array<{fieldId: string; fieldValue: string}> = [];

    forIn(customFieldsObject, (value, key) =>
        customFields.push({
            fieldId: key,
            fieldValue: isDate(value) ? value.toISOString().slice(0, 10) : value,
        })
    );

    return {
        ...address,
        customFields,
    };
}
