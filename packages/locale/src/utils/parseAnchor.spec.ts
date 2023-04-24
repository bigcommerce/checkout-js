import parseAnchor from './parseAnchor';

describe('parseAnchor()', () => {
    it('returns empty prefix and suffix if there is just an anchor element', () => {
        expect(parseAnchor('<a>text</a>')).toEqual(['', 'text', '']);

        expect(parseAnchor('<a href="something">text</a>')).toEqual(['', 'text', '']);
    });

    it('returns prefix and suffix if anchor is surrounded by text', () => {
        expect(parseAnchor('foo <a>text</a> bar')).toEqual(['foo ', 'text', ' bar']);

        expect(parseAnchor('foo <a href="something">text</a> bar')).toEqual([
            'foo ',
            'text',
            ' bar',
        ]);
    });

    it('returns first anchor if theres more than one', () => {
        expect(parseAnchor('foo <a>text</a> s <a>x</a> bar')).toEqual([
            'foo ',
            'text',
            ' s <a>x</a> bar',
        ]);
    });

    it('returns empty array if no anchor', () => {
        expect(parseAnchor('foo text bar')).toEqual([]);
    });
});
