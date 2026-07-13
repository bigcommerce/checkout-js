import { B2B_EXTRA_FIELD_PREFIX, type OrderRequestBody } from '@bigcommerce/checkout-sdk/essential';

import {
    type B2BPaymentFormValues,
    getRecordValue,
    getStringValue,
    hasNonEmptyExtraFieldValue,
} from './b2bMetadata';

type B2BOrderRequestExtraField = NonNullable<OrderRequestBody['orderExtraFields']>[number];

type B2BOrderRequestFields = Pick<
    OrderRequestBody,
    'additionalText' | 'orderExtraFields' | 'poNumber'
>;

const toRawExtraFieldId = (fieldName: string): string =>
    fieldName.startsWith(B2B_EXTRA_FIELD_PREFIX)
        ? fieldName.slice(B2B_EXTRA_FIELD_PREFIX.length)
        : fieldName;

const getOrderExtraFieldValues = (value: unknown): B2BOrderRequestExtraField[] =>
    Object.entries(getRecordValue(value) ?? {})
        .filter(hasNonEmptyExtraFieldValue)
        .map(([fieldName, fieldValue]) => ({
            fieldId: toRawExtraFieldId(fieldName),
            fieldValue,
        }));

export const mapToB2BOrderRequestBody = ({
    poNumber,
    additionalPaymentField,
    orderExtraFields,
}: B2BPaymentFormValues): B2BOrderRequestFields => {
    const fields: B2BOrderRequestFields = {};

    const poNumberValue = getStringValue(poNumber);
    const additionalText = getStringValue(additionalPaymentField);
    const orderExtraFieldValues = getOrderExtraFieldValues(orderExtraFields);

    if (poNumberValue) {
        fields.poNumber = poNumberValue;
    }

    if (additionalText) {
        fields.additionalText = additionalText;
    }

    if (orderExtraFieldValues.length > 0) {
        fields.orderExtraFields = orderExtraFieldValues;
    }

    return fields;
};
