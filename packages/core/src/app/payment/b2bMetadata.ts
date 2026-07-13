import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

export interface B2BPaymentFormValues {
    poNumber?: unknown;
    invoicePaymentComment?: unknown;
    additionalPaymentField?: unknown;
    orderExtraFields?: unknown;
}

export const getStringValue = (value: unknown): string | undefined =>
    typeof value === 'string' ? value : undefined;

export const getRecordValue = (value: unknown): Record<string, unknown> | undefined =>
    typeof value === 'object' && value !== null && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : undefined;

export const hasNonEmptyExtraFieldValue = (
    entry: [string, unknown],
): entry is [string, string | number] => {
    const value = entry[1];

    return typeof value === 'number' || (typeof value === 'string' && value !== '');
};

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
        orderExtraFields: getRecordValue(orderExtraFields),
    });
};

export const clearB2BMetadataStorage = (): void => {
    B2BSessionStorage.clearAll();
};
