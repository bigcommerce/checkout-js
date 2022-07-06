import joinPaths from './joinPaths';

describe('joinPaths()', () => {
    it('joins paths with trailing slashes', () => {
        expect(joinPaths('foo/', '/bar'))
            .toEqual('foo/bar');

        expect(joinPaths('foo/', '/bar', 'hello/', '/world'))
            .toEqual('foo/bar/hello/world');
    });

    it('joins paths without trailing slashes', () => {
        expect(joinPaths('foo', 'bar'))
            .toEqual('foo/bar');

        expect(joinPaths('foo', 'bar', 'hello', 'world'))
            .toEqual('foo/bar/hello/world');
    });

    it('retains slashes that are valid', () => {
        expect(joinPaths('/foo/', '/bar/'))
            .toEqual('/foo/bar/');

        expect(joinPaths('/foo/', '/bar/', '/hello/', '/world/'))
            .toEqual('/foo/bar/hello/world/');
    });
});
