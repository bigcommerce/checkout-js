import createCustomErrorType from './createCustomErrorType';

describe('createCustomError()', () => {
    it('should return new error types', () => {
        const reportableError = createCustomErrorType({ name: 'x', shouldReport: true });
        const ignorableError = createCustomErrorType({ name: 'y', shouldReport: false });

        expect(reportableError.shouldReport).toBe(true);
        expect(ignorableError.shouldReport).toBe(false);
    });

    it('should return a constructor function that inherits from Error class', () => {
        const name = 'Foo';
        const MyError = createCustomErrorType({ name });
        const myError = new MyError();

        expect(myError instanceof MyError).toBe(true);
        expect(myError instanceof Error).toBe(true);
        expect(myError.name).toEqual(name);
    });

    it('should allow the constructor to take a data param', () => {
        const errorMessage = 'bar';
        const MyError = createCustomErrorType({ name: 'Bar' });
        const myError = new MyError({ message: errorMessage });

        expect(myError.data.message).toEqual(errorMessage);
    });

    it('creates `Error` instances with `type` property', () => {
        const MyError = createCustomErrorType({ name: 'Foobar' });
        const myError = new MyError();

        expect(myError.type).toBe('custom');
    });
});
