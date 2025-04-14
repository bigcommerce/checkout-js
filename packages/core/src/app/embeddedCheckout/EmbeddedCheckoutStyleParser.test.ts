import EmbeddedCheckoutStyleParser from './EmbeddedCheckoutStyleParser';
import { styles } from './embeddedCheckoutStyles.mock';

describe('EmbeddedCheckoutStyleParser', () => {
    let parser: EmbeddedCheckoutStyleParser;

    beforeEach(() => {
        parser = new EmbeddedCheckoutStyleParser();
    });

    it('converts config to CSS rules', () => {
        expect(parser.parse(styles)).toMatchSnapshot();
    });

    it('returns empty array if there is empty config', () => {
        expect(parser.parse({})).toEqual([]);
    });
});
