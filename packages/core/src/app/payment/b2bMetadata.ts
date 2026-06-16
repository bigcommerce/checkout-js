import { type FormField, type PersistB2BMetadataOptions } from '@bigcommerce/checkout-sdk';

import { B2BSessionStorage, type B2BStoredMetadata } from '@bigcommerce/checkout/utility';

type B2BMetadataExtraField = NonNullable<PersistB2BMetadataOptions['extraFields']>[number];
type B2BMetadataExtraInfo = NonNullable<PersistB2BMetadataOptions['extraInfo']>;

type StoredAddressMetadata = Pick<
    B2BStoredMetadata,
    'billingExtraFields' | 'shippingExtraFields' | 'billingAddressId' | 'shippingAddressId'
>;

export const buildExtraFields = (
    storedExtraFields?: Record<string, unknown>,
    fields?: FormField[],
): B2BMetadataExtraField[] =>
    storedExtraFields
        ? Object.entries(storedExtraFields).map(([fieldName, fieldValue]) => ({
              // The API expects the field label, but values are stored keyed by field name (id).
              fieldName: fields?.find((field) => field.name === fieldName)?.label ?? fieldName,
              fieldValue: fieldValue as B2BMetadataExtraField['fieldValue'],
          }))
        : [];

// TODO: CHECKOUT-10080`shouldSaveAddress` is persisted alongside the address extra fields for a separate
// "save to company address book" task, so it must not be sent in the post-order payload.
const SHOULD_SAVE_ADDRESS_KEY = 'shouldSaveAddress';

const omitShouldSaveAddress = (
    storedExtraFields?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
    if (!storedExtraFields) {
        return storedExtraFields;
    }

    const { [SHOULD_SAVE_ADDRESS_KEY]: _shouldSaveAddress, ...extraFieldsToPersist } =
        storedExtraFields;

    return extraFieldsToPersist;
};

export const buildAddressExtraInfo = (
    {
        billingExtraFields,
        shippingExtraFields,
        billingAddressId,
        shippingAddressId,
    }: StoredAddressMetadata,
    addressExtraFields?: FormField[],
): B2BMetadataExtraInfo => {
    const billing = omitShouldSaveAddress(billingExtraFields);
    const shipping = omitShouldSaveAddress(shippingExtraFields);

    const extraInfo: B2BMetadataExtraInfo = {};

    if (billing || shipping) {
        extraInfo.addressExtraFields = {
            billingAddressExtraFields: buildExtraFields(billing, addressExtraFields),
            shippingAddressExtraFields: buildExtraFields(shipping, addressExtraFields),
        };
    }

    if (billingAddressId) {
        extraInfo.billingAddressId = billingAddressId;
    }

    if (shippingAddressId) {
        // The SDK field is spelled with a triple "p" (shipppingAddressId).
        extraInfo.shipppingAddressId = shippingAddressId;
    }

    return extraInfo;
};

interface B2BMetadataFieldDefinitions {
    orderExtraFields?: FormField[];
    addressExtraFields?: FormField[];
}

export const buildB2BMetadataOptions = (
    isInvoice: PersistB2BMetadataOptions['isInvoice'],
    { orderExtraFields, addressExtraFields }: B2BMetadataFieldDefinitions = {},
): PersistB2BMetadataOptions => {
    const {
        invoiceComment,
        poNumber,
        additionalPaymentField,
        orderExtraFields: storedOrderExtraFields,
        ...storedAddressMetadata
    } = B2BSessionStorage.getAll();

    return {
        isInvoice,
        invoiceComment,
        poNumber,
        referenceNumber: additionalPaymentField,
        extraFields: buildExtraFields(storedOrderExtraFields, orderExtraFields),
        extraInfo: buildAddressExtraInfo(storedAddressMetadata, addressExtraFields),
    };
};

// Clear all B2B sessionStorage after a successful persist.
export const clearB2BMetadataStorage = (): void => {
    B2BSessionStorage.clearAll();
};
