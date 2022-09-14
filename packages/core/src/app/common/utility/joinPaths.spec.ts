import joinPaths from './joinPaths';

describe('joinPaths()', () => {
    it('joins paths with trailing slashes', () => {
        expect(joinPaths('foo/', '/bar')).toBe('foo/bar');

        expect(joinPaths('foo/', '/bar', 'hello/', '/world')).toBe('foo/bar/hello/world');
    });

    it('joins paths without trailing slashes', () => {
        expect(joinPaths('foo', 'bar')).toBe('foo/bar');

        expect(joinPaths('foo', 'bar', 'hello', 'world')).toBe('foo/bar/hello/world');
    });

    it('retains slashes that are valid', () => {
        expect(joinPaths('/foo/', '/bar/')).toBe('/foo/bar/');

        expect(joinPaths('/foo/', '/bar/', '/hello/', '/world/')).toBe('/foo/bar/hello/world/');
    });
});
