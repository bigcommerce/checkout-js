import { UnassignItemError } from '.';

describe('UnassignItemError', () => {
    it('should throw an error with the correct constructor data', () => {
        const unassignItemError = new UnassignItemError(new Error('error message'));

        expect(unassignItemError.name).toBe('UNASSIGN_ITEM_FAILED');
        expect(unassignItemError.type).toBe('custom');
        expect(unassignItemError.data.message).toBe('error message');
    })
})
