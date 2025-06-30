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
                    typeof field.type !== "undefined" && field.type === 'integer'
                        ? { ...field, required: true }
                        : field,
                ),
            );

            expect(output).toBe(false);
        });
    });

    describe('address fields max length validation', () => {
        it('returns false if address exceeds max length and experiment is on', () => {
            const formFieldsWithMaxLength = getFormFields().map(field => {
                const { name } = field;
                
                if(name === 'address1') {
                    return { ...field, maxLength: 20 };
                }
                else if (name === 'address2') {
                    return { ...field, maxLength: 10 };
                }
                
                return field;
            });
            
            expect(isValidAddress({ ...getAddress(), address1: 'this is a long address 1 from somewhere' }, formFieldsWithMaxLength)).toBe(false);
            expect(isValidAddress({ ...getAddress(), address2: 'this is a long address 2' }, formFieldsWithMaxLength)).toBe(false);
        });
    })
    
});
