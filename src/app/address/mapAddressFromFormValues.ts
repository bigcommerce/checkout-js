import { Address } from '@bigcommerce/checkout-sdk';
import { forIn, isDate } from 'lodash';

import { AddressFormValues } from './mapAddressToFormValues';

export default function mapAddressFromFormValues(formValues: AddressFormValues): Address {
    const { customFields: customFieldsObject, ...address } = formValues;
    const customFields: Array<{fieldId: string; fieldValue: string}> = [];

    forIn(customFieldsObject, (value, key) => {
        let fieldValue: string;

        if (isDate(value)) {
            const dateValue = new Date(value);
            // We want the field value to match the exact date that the user entered.
            // However, when we call toISOString, it will converted to UTC and the user timezone could affect the
            // UTC representation by ±1 day. To avoid this, subtract the time offset from the date.
            dateValue.setMinutes(dateValue.getMinutes() - dateValue.getTimezoneOffset());
            fieldValue = dateValue.toISOString().slice(0, 10);
        } else {
            fieldValue = value;
        }

        customFields.push({
            fieldId: key,
            fieldValue,
        });
    });

    return {
        ...address,
        customFields,
    };
}
