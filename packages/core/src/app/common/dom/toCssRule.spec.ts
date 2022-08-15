import toCSSRule from './toCssRule';

describe('toCSSRule()', () => {
    it('converts to CSS rule', () => {
        const styles = { backgroundColor: '#fff', color: '#000' };

        expect(toCSSRule('.foobar', styles)).toBe('.foobar {background-color: #fff; color: #000;}');
    });

    it('merges CSS styles', () => {
        const stylesA = { backgroundColor: '#fff', color: '#000' };
        const stylesB = { color: '#333', padding: '10px' };

        expect(toCSSRule('.foobar', stylesA, stylesB)).toBe(
            '.foobar {background-color: #fff; color: #333; padding: 10px;}',
        );
    });
});
