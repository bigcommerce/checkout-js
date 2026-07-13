import {
    type Address,
    B2B_EXTRA_FIELD_PREFIX,
    type FormField,
    type PersistB2BMetadataOptions,
} from '@bigcommerce/checkout-sdk/essential';

import { B2BSessionStorage, type B2BStoredPaymentValues } from '@bigcommerce/checkout/utility';

import {
    type B2BPaymentFormValues,
    getRecordValue,
    getStringValue,
    hasNonEmptyExtraFieldValue,
} from './b2bMetadata';

type B2BMetadataExtraField = NonNullable<PersistB2BMetadataOptions['extraFields']>[number];
type B2BMetadataExtraInfo = NonNullable<PersistB2BMetadataOptions['extraInfo']>;
type FieldLabelLookup = ReadonlyMap<string, string>;

interface B2BMetadataSources {
    formValues?: B2BPaymentFormValues;
    billingAddress?: Address;
    shippingAddress?: Address;
    orderExtraFields?: FormField[];
    addressExtraFields?: FormField[];
}

const getExtraFieldLabel = (
    fieldName: string,
    fieldLabels: FieldLabelLookup,
    fallback = fieldName,
): string => fieldLabels.get(fieldName) ?? fallback;

const mapOrderExtraFieldsValues = (
    formExtraFields: Record<string, unknown>,
    fieldLabels: FieldLabelLookup,
): B2BMetadataExtraField[] =>
    Object.entries(formExtraFields)
        .filter(hasNonEmptyExtraFieldValue)
        .map(([fieldName, fieldValue]) => ({
            // The API expects the field label, but form values are keyed by field name (id).
            fieldName: getExtraFieldLabel(fieldName, fieldLabels),
            fieldValue,
        }));

const createExtraFieldLabelLookup = (fields?: FormField[]): FieldLabelLookup =>
    new Map(fields?.map(({ name, label }) => [name, label]) ?? []);

export const getOrderExtraFieldsValues = (
    formExtraFields?: Record<string, unknown>,
    fields?: FormField[],
): B2BMetadataExtraField[] => {
    if (!formExtraFields) {
        return [];
    }

    return mapOrderExtraFieldsValues(formExtraFields, createExtraFieldLabelLookup(fields));
};

const mapAddressExtraFields = (
    extraFieldValues: NonNullable<Address['extraFields']>,
    fieldLabels: FieldLabelLookup,
): B2BMetadataExtraField[] =>
    extraFieldValues.map(({ fieldId, fieldValue }) => ({
        fieldName: getExtraFieldLabel(`${B2B_EXTRA_FIELD_PREFIX}${fieldId}`, fieldLabels, fieldId),
        fieldValue,
    }));

export const getExtraInfoValues = (
    billingAddress?: Address,
    shippingAddress?: Address,
    addressExtraFields?: FormField[],
): B2BMetadataExtraInfo => {
    const extraInfo: B2BMetadataExtraInfo = {};
    const fieldLabels = createExtraFieldLabelLookup(addressExtraFields);

    const billingAddressExtraFields = mapAddressExtraFields(
        billingAddress?.extraFields ?? [],
        fieldLabels,
    );

    const shippingAddressExtraFields = mapAddressExtraFields(
        shippingAddress?.extraFields ?? [],
        fieldLabels,
    );

    if (billingAddressExtraFields.length > 0 || shippingAddressExtraFields.length > 0) {
        extraInfo.addressExtraFields = {
            billingAddressExtraFields,
            shippingAddressExtraFields,
        };
    }

    const { billingAddressId, shippingAddressId } = B2BSessionStorage.getAddressIds();

    if (billingAddressId) {
        extraInfo.billingAddressId = billingAddressId;
    }

    if (shippingAddressId) {
        // The SDK field is spelled with a triple "p" (shipppingAddressId).
        extraInfo.shipppingAddressId = shippingAddressId;
    }

    return extraInfo;
};

export const getB2BMetadataPayload = (
    isInvoice: PersistB2BMetadataOptions['isInvoice'],
    {
        formValues,
        billingAddress,
        shippingAddress,
        orderExtraFields,
        addressExtraFields,
    }: B2BMetadataSources = {},
): PersistB2BMetadataOptions => {
    const sourceValues: B2BPaymentFormValues | B2BStoredPaymentValues | undefined =
        formValues ?? B2BSessionStorage.getPaymentValues();

    return {
        isInvoice,
        invoiceComment: getStringValue(sourceValues?.invoicePaymentComment),
        poNumber: getStringValue(sourceValues?.poNumber),
        referenceNumber: getStringValue(sourceValues?.additionalPaymentField),
        extraFields: getOrderExtraFieldsValues(
            getRecordValue(sourceValues?.orderExtraFields),
            orderExtraFields,
        ),
        extraInfo: getExtraInfoValues(billingAddress, shippingAddress, addressExtraFields),
    };
};
