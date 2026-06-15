import { type FormField, type PersistB2BMetadataOptions } from '@bigcommerce/checkout-sdk';

import { clearPoNumber, getPoNumber } from '@bigcommerce/checkout/utility';

import { B2BExtraFieldsSessionStorage } from '../address';

import { AdditionalPaymentFieldSessionStorage } from './AdditionalPaymentFieldSessionStorage';
import { InvoicePaymentCommentSessionStorage } from './InvoicePaymentCommentSessionStorage';

type B2BMetadataExtraField = NonNullable<PersistB2BMetadataOptions['extraFields']>[number];
type B2BMetadataExtraInfo = NonNullable<PersistB2BMetadataOptions['extraInfo']>;

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

export const buildOrderExtraFields = (orderExtraFields?: FormField[]): B2BMetadataExtraField[] =>
    buildExtraFields(
        B2BExtraFieldsSessionStorage.getFields(B2BExtraFieldsSessionStorage.ORDER_KEY),
        orderExtraFields,
    );

// TODO: CHECKOUT-10080`shouldSaveAddress` is persisted alongside the address extra fields for a separate
// "save to company address book" task, so it must not be sent in the post-order payload.
const SHOULD_SAVE_ADDRESS_KEY = 'shouldSaveAddress';

const omitShouldSaveAddress = (
    storedExtraFields?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
    if (!storedExtraFields) {
        return storedExtraFields;
    }

    const { [SHOULD_SAVE_ADDRESS_KEY]: _shouldSaveAddress, ...rest } = storedExtraFields;

    return rest;
};

export const buildAddressExtraInfo = (addressExtraFields?: FormField[]): B2BMetadataExtraInfo => {
    const billing = omitShouldSaveAddress(
        B2BExtraFieldsSessionStorage.getFields(B2BExtraFieldsSessionStorage.BILLING_KEY),
    );
    const shipping = omitShouldSaveAddress(
        B2BExtraFieldsSessionStorage.getFields(B2BExtraFieldsSessionStorage.SHIPPING_KEY),
    );
    const billingAddressId = B2BExtraFieldsSessionStorage.getAddressId(
        B2BExtraFieldsSessionStorage.BILLING_ADDRESS_ID_KEY,
    );
    const shippingAddressId = B2BExtraFieldsSessionStorage.getAddressId(
        B2BExtraFieldsSessionStorage.SHIPPING_ADDRESS_ID_KEY,
    );

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
): PersistB2BMetadataOptions => ({
    isInvoice,
    invoiceComment: InvoicePaymentCommentSessionStorage.get(),
    poNumber: getPoNumber(),
    referenceNumber: AdditionalPaymentFieldSessionStorage.get(),
    extraFields: buildOrderExtraFields(orderExtraFields),
    extraInfo: buildAddressExtraInfo(addressExtraFields),
});

// Clear all B2B sessionStorage after a successful persist.
export const clearB2BMetadataStorage = (): void => {
    clearPoNumber();
    AdditionalPaymentFieldSessionStorage.remove();
    InvoicePaymentCommentSessionStorage.remove();
    B2BExtraFieldsSessionStorage.removeFields(B2BExtraFieldsSessionStorage.ORDER_KEY);
    B2BExtraFieldsSessionStorage.removeFields(B2BExtraFieldsSessionStorage.BILLING_KEY);
    B2BExtraFieldsSessionStorage.removeFields(B2BExtraFieldsSessionStorage.SHIPPING_KEY);
    B2BExtraFieldsSessionStorage.removeAddressId(
        B2BExtraFieldsSessionStorage.BILLING_ADDRESS_ID_KEY,
    );
    B2BExtraFieldsSessionStorage.removeAddressId(
        B2BExtraFieldsSessionStorage.SHIPPING_ADDRESS_ID_KEY,
    );
};
