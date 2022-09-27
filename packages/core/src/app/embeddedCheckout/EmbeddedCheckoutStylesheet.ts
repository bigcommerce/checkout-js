import { EmbeddedCheckoutStyles } from '@bigcommerce/checkout-sdk';

import { appendStylesheet } from '../common/dom';

import EmbeddedCheckoutStyleParser from './EmbeddedCheckoutStyleParser';

export default class EmbeddedCheckoutStylesheet {
    private _parser: EmbeddedCheckoutStyleParser;

    constructor(embeddedCheckoutStyleParser: EmbeddedCheckoutStyleParser) {
        this._parser = embeddedCheckoutStyleParser;
    }

    append(styles: EmbeddedCheckoutStyles): HTMLStyleElement {
        return appendStylesheet(this._parser.parse(styles));
    }
}
