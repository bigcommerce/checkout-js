import EmbeddedCheckoutStylesheet from './EmbeddedCheckoutStylesheet';
import EmbeddedCheckoutStyleParser from './EmbeddedCheckoutStyleParser';

export default function createEmbeddedCheckoutStylesheet() {
    const embeddedCheckoutStyleParser = new EmbeddedCheckoutStyleParser();

    return new EmbeddedCheckoutStylesheet(embeddedCheckoutStyleParser);
}
