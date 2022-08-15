import { EmbeddedCheckoutStyles } from '@bigcommerce/checkout-sdk';

import EmbeddedCheckoutStyleParser from './EmbeddedCheckoutStyleParser';
import EmbeddedCheckoutStylesheet from './EmbeddedCheckoutStylesheet';

describe('EmbeddedCheckoutStylesheet', () => {
    let stylesheet: EmbeddedCheckoutStylesheet;
    let parser: EmbeddedCheckoutStyleParser;
    let styles: EmbeddedCheckoutStyles;

    beforeEach(() => {
        parser = new EmbeddedCheckoutStyleParser();
        styles = { body: { backgroundColor: '#000' } };

        jest.spyOn(parser, 'parse');

        stylesheet = new EmbeddedCheckoutStylesheet(parser);
    });

    it('parses style config', () => {
        stylesheet.append(styles);

        expect(parser.parse).toHaveBeenCalledWith(styles);
    });

    it('creates stylesheet tag', () => {
        const tag = stylesheet.append(styles);
        const sheet = tag.sheet as CSSStyleSheet;

        expect(sheet.cssRules[0].cssText).toBe('body {background-color: #000;}');
    });

    it('appends stylesheet tag to head', () => {
        const tag = stylesheet.append(styles);

        expect(tag.parentElement).toEqual(document.head);
    });
});
