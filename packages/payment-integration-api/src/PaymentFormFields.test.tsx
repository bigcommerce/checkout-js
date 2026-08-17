import { getPaymentFormFields, type PaymentFormField } from './PaymentFormFields';

const fields: PaymentFormField[] = [
    {
        name: 'Purchase Order',
        id: 'purchaseOrderNumber',
        required: true,
        type: 'number',
        fieldType: 'text',
    },
];

describe('getPaymentFormFields', () => {
    it('returns empty array when value is undefined', () => {
        expect(getPaymentFormFields(undefined)).toEqual([]);
    });

    it('returns empty array when value is null', () => {
        expect(getPaymentFormFields(null)).toEqual([]);
    });

    it('returns empty array when value is not an array', () => {
        expect(getPaymentFormFields({ formFieldsData: [] })).toEqual([]);
    });

    it('returns the array when value is a valid array', () => {
        expect(getPaymentFormFields(fields)).toEqual(fields);
    });
});
