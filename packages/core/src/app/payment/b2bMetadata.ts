import {
    type Address,
    B2B_EXTRA_FIELD_PREFIX,
    type FormField,
    type PersistB2BMetadataOptions,
} from '@bigcommerce/checkout-sdk/essential';

import { B2BSessionStorage, type B2BStoredPaymentValues } from '@bigcommerce/checkout/utility';

type B2BMetadataExtraField = NonNullable<PersistB2BMetadataOptions['extraFields']>[number];
type B2BMetadataExtraInfo = NonNullable<PersistB2BMetadataOptions['extraInfo']>;

export interface B2BPaymentFormValues {
    poNumber?: unknown;
    invoicePaymentComment?: unknown;
    additionalPaymentField?: unknown;
    orderExtraFields?: unknown;
}

const getStringValue = (value: unknown): string | undefined =>
    typeof value === 'string' ? value : undefined;

const getOrderExtraFieldValues = (value: unknown): Record<string, unknown> | undefined =>
    // The payment form types its values loosely; this is the single assertion that types them.
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined;

// Captures the B2B fields of the payment form when the shopper submits the
// order, so they survive an off-site payment redirect.
export const storeB2BPaymentValues = ({
    poNumber,
    invoicePaymentComment,
    additionalPaymentField,
    orderExtraFields,
}: B2BPaymentFormValues): void => {
    B2BSessionStorage.setPaymentValues({
        poNumber: getStringValue(poNumber),
        invoicePaymentComment: getStringValue(invoicePaymentComment),
        additionalPaymentField: getStringValue(additionalPaymentField),
        orderExtraFields: getOrderExtraFieldValues(orderExtraFields),
    });
};

export const buildExtraFields = (
    formExtraFields?: Record<string, unknown>,
    fields?: FormField[],
): B2BMetadataExtraField[] =>
    formExtraFields
        ? Object.entries(formExtraFields).map(([fieldName, fieldValue]) => ({
              // The API expects the field label, but form values are keyed by field name (id).
              fieldName: fields?.find((field) => field.name === fieldName)?.label ?? fieldName,
              fieldValue: fieldValue as B2BMetadataExtraField['fieldValue'],
          }))
        : [];

// Address extra-field values come from the checkout object keyed by raw field id,
// while the field definitions are named with the `B2B_EXTRA_FIELD_PREFIX`.
export const buildAddressExtraFields = (
    extraFieldValues?: Address['extraFields'],
    fields?: FormField[],
): B2BMetadataExtraField[] =>
    (extraFieldValues ?? []).map(({ fieldId, fieldValue }) => ({
        fieldName:
            fields?.find((field) => field.name === `${B2B_EXTRA_FIELD_PREFIX}${fieldId}`)?.label ??
            fieldId,
        fieldValue,
    }));

export const buildAddressExtraInfo = (
    billingAddress?: Address,
    shippingAddress?: Address,
    addressExtraFields?: FormField[],
): B2BMetadataExtraInfo => {
    const extraInfo: B2BMetadataExtraInfo = {};

    if (billingAddress?.extraFields?.length || shippingAddress?.extraFields?.length) {
        extraInfo.addressExtraFields = {
            billingAddressExtraFields: buildAddressExtraFields(
                billingAddress?.extraFields,
                addressExtraFields,
            ),
            shippingAddressExtraFields: buildAddressExtraFields(
                shippingAddress?.extraFields,
                addressExtraFields,
            ),
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

interface B2BMetadataSources {
    formValues?: B2BPaymentFormValues;
    billingAddress?: Address;
    shippingAddress?: Address;
    orderExtraFields?: FormField[];
    addressExtraFields?: FormField[];
}

export const buildB2BMetadataOptions = (
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
        extraFields: buildExtraFields(
            getOrderExtraFieldValues(sourceValues?.orderExtraFields),
            orderExtraFields,
        ),
        extraInfo: buildAddressExtraInfo(billingAddress, shippingAddress, addressExtraFields),
    };
};

export const clearB2BMetadataStorage = (): void => {
    B2BSessionStorage.clearAll();
};
