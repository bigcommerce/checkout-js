import { Address } from '@bigcommerce/checkout-sdk';
import { forIn, isDate, padStart } from 'lodash';

import { AddressFormValues } from './mapAddressToFormValues';

export default function mapAddressFromFormValues(formValues: AddressFormValues): Address {
    const { customFields: customFieldsObject, ...address } = formValues;
    const shouldSaveAddress = formValues.shouldSaveAddress;
    const customFields: Array<{fieldId: string; fieldValue: string}> = [];

    forIn(customFieldsObject, (value, key) => {
        let fieldValue: string;

        if (isDate(value)) {
            const padMonth = padStart((value.getMonth() + 1).toString(), 2, '0');
            const padDay = padStart((value.getDate()).toString(), 2, '0');
            fieldValue = `${value.getFullYear()}-${padMonth}-${padDay}`;
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
        shouldSaveAddress,
        customFields,
    };
}
