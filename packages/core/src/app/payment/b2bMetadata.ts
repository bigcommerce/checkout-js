import { type PersistB2BMetadataOptions } from '@bigcommerce/checkout-sdk';

import { clearPoNumber, getPoNumber } from '@bigcommerce/checkout/utility';

import { B2BExtraFieldsSessionStorage } from '../address';

import { AdditionalPaymentFieldSessionStorage } from './AdditionalPaymentFieldSessionStorage';
import { InvoicePaymentCommentSessionStorage } from './InvoicePaymentCommentSessionStorage';

export type B2BMetadataExtraField = NonNullable<PersistB2BMetadataOptions['extraFields']>[number];
export type B2BMetadataExtraInfo = NonNullable<PersistB2BMetadataOptions['extraInfo']>;

export const buildExtraFields = (stored?: Record<string, unknown>): B2BMetadataExtraField[] =>
    stored
        ? Object.entries(stored).map(([fieldName, fieldValue]) => ({
              fieldName,
              fieldValue: fieldValue as B2BMetadataExtraField['fieldValue'],
          }))
        : [];

export const buildOrderExtraFields = (): B2BMetadataExtraField[] =>
    buildExtraFields(
        B2BExtraFieldsSessionStorage.getFields(B2BExtraFieldsSessionStorage.ORDER_KEY),
    );

export const buildAddressExtraInfo = (): B2BMetadataExtraInfo => {
    const billing = B2BExtraFieldsSessionStorage.getFields(
        B2BExtraFieldsSessionStorage.BILLING_KEY,
    );
    const shipping = B2BExtraFieldsSessionStorage.getFields(
        B2BExtraFieldsSessionStorage.SHIPPING_KEY,
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
            billingAddressExtraFields: buildExtraFields(billing),
            shippingAddressExtraFields: buildExtraFields(shipping),
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

export const buildB2BMetadataOptions = (
    isInvoice: PersistB2BMetadataOptions['isInvoice'],
): PersistB2BMetadataOptions => ({
    isInvoice,
    invoiceComment: InvoicePaymentCommentSessionStorage.get(),
    poNumber: getPoNumber(),
    referenceNumber: AdditionalPaymentFieldSessionStorage.get(),
    extraFields: buildOrderExtraFields(),
    extraInfo: buildAddressExtraInfo(),
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
