import { AssignItemFailedError } from '.';

describe('AssignItemFailedError', () => {
    it('should throw an error with the correct constructor data', () => {
        const assignItemFailedError = new AssignItemFailedError(new Error('error message'));

        expect(assignItemFailedError.name).toBe('ASSIGN_ITEM_FAILED');
        expect(assignItemFailedError.type).toBe('custom');
        expect(assignItemFailedError.data.message).toBe('error message');
    })
})
