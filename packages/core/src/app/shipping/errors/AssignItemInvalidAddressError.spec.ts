import { AssignItemInvalidAddressError } from '.';

describe('AssignItemInvalidAddressError', () => {
    it('should throw an error with the correct constructor data', () => {
        const assignItemInvalidAddressError = new AssignItemInvalidAddressError(new Error('error message'));

        expect(assignItemInvalidAddressError.name).toBe('ASSIGN_ITEM_INVALID_ADDRESS');
        expect(assignItemInvalidAddressError.type).toBe('custom');
        expect(assignItemInvalidAddressError.title).toBe('Invalid Address');
        expect(assignItemInvalidAddressError.data.message).toBe('error message');
    })
})
