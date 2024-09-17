import isErrorWithMessage from './isErrorWithMessage';

describe('isErrorWithMessage', () => {
    it('returns true if error object has message property', () => {
        expect(isErrorWithMessage({ message: 'test' })).toBe(true);
    });

    it('returns false if error object does no have message property', () => {
        expect(isErrorWithMessage({})).toBe(false);
    });
});
