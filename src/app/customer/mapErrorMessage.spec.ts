import mapErrorMessage from './mapErrorMessage';

describe('mapErrorMessage()', () => {
    let translate: (key: string) => string;

    beforeEach(() => {
        translate = jest.fn(key => key);
    });

    it('returns translated throttled error message', () => {
        expect(mapErrorMessage({ body: { type: 'throttled_login' } }, translate))
            .toEqual('customer.sign_in_throttled_error');

        expect(translate)
            .toHaveBeenCalledWith('customer.sign_in_throttled_error');
    });

    it('returns translated reset password error message', () => {
        expect(mapErrorMessage({ body: { type: 'reset_password_before_login' } }, translate))
            .toEqual('customer.reset_password_before_login_error');

        expect(translate)
            .toHaveBeenCalledWith('customer.reset_password_before_login_error');
    });

    it('returns translated sign in error message by default', () => {
        expect(mapErrorMessage({ body: { type: 'some_unknown_error' } }, translate))
            .toEqual('customer.sign_in_error');

        expect(translate)
            .toHaveBeenCalledWith('customer.sign_in_error');
    });
});
