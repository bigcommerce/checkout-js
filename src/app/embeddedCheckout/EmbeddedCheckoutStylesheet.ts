import { EmbeddedCheckoutStyles } from '@bigcommerce/checkout-sdk';

import EmbeddedCheckoutStyleParser from './EmbeddedCheckoutStyleParser';

export default class EmbeddedCheckoutStylesheet {
    private _parser: EmbeddedCheckoutStyleParser;

    constructor(
        embeddedCheckoutStyleParser: EmbeddedCheckoutStyleParser
    ) {
        this._parser = embeddedCheckoutStyleParser;
    }

    append(styles: EmbeddedCheckoutStyles): HTMLStyleElement {
        const style = document.createElement('style');
        const rules = this._parser.parse(styles);

        document.head.appendChild(style);

        if (style.sheet instanceof CSSStyleSheet) {
            const { sheet } = style;

            rules.forEach((rule, index) => {
                sheet.insertRule(rule, index);
            });
        }

        return style;
    }
}
