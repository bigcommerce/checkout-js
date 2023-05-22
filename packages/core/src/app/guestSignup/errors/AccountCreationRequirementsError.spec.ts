import AccountCreationRequirementsError from './AccountCreationRequirementsError';

describe('AccountCreationRequirementsError', () => {
    it('should throw an error with the correct constructor data', () => {
        const accountCreationRequirementsError = new AccountCreationRequirementsError(new Error('error message'), 'requirements');

        expect(accountCreationRequirementsError.name).toBe('ACCOUNT_CREATION_REQUIREMENTS_ERROR');
        expect(accountCreationRequirementsError.type).toBe('custom');
        expect(accountCreationRequirementsError.title).toBe('Password does not match requirements');
        expect(accountCreationRequirementsError.data.message).toBe('error message');
    })
})
