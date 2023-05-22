import { AccountCreationFailedError } from '.';

describe('AccountCreationFailedError', () => {
    it('should throw an error with the correct constructor data', () => {
        const accountCreationFailedError = new AccountCreationFailedError(new Error('error message'));

        expect(accountCreationFailedError.name).toBe('ACCOUNT_CREATION_FAILED');
        expect(accountCreationFailedError.type).toBe('custom');
        expect(accountCreationFailedError.data.message).toBe('error message');
    })
})
