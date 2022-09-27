import { getAddress } from './address.mock';
import { getFormFields } from './formField.mock';
import isValidAddress from './isValidAddress';

describe('isValidAddress()', () => {
    it('returns true if all required fields are defined', () => {
        expect(isValidAddress(getAddress(), getFormFields())).toBe(true);
    });

    it('returns false if some required fields are not defined', () => {
        expect(isValidAddress({ ...getAddress(), address1: '' }, getFormFields())).toBe(false);
    });

    describe('when field is dropdown', () => {
        it('returns false if dropdown is required but not defined', () => {
            const output = isValidAddress(
                getAddress(),
                getFormFields().map((field) =>
                    field.fieldType === 'dropdown' ? { ...field, required: true } : field,
                ),
            );

            expect(output).toBe(false);
        });

        it('returns true if dropdown is required and defined', () => {
            const output = isValidAddress(
                {
                    ...getAddress(),
                    customFields: [{ fieldId: 'field_27', fieldValue: '0' }],
                },
                getFormFields().map((field) =>
                    field.type === 'array' ? { ...field, required: true } : field,
                ),
            );

            expect(output).toBe(true);
        });
    });

    describe('when field is number', () => {
        it('returns true if field is required and defined as 0', () => {
            const output = isValidAddress(
                {
                    ...getAddress(),
                    customFields: [{ fieldId: 'field_31', fieldValue: 0 }],
                },
                getFormFields().map((field) =>
                    field.type === 'integer' ? { ...field, required: true } : field,
                ),
            );

            expect(output).toBe(true);
        });

        it('returns false if field is required and not defined', () => {
            const output = isValidAddress(
                getAddress(),
                getFormFields().map((field) =>
                    typeof field.type !== undefined && field.type === 'integer'
                        ? { ...field, required: true }
                        : field,
                ),
            );

            expect(output).toBe(false);
        });
    });
});
