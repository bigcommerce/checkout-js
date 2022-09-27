import EmbeddedCheckoutStyleParser from './EmbeddedCheckoutStyleParser';
import EmbeddedCheckoutStylesheet from './EmbeddedCheckoutStylesheet';

export default function createEmbeddedCheckoutStylesheet() {
    const embeddedCheckoutStyleParser = new EmbeddedCheckoutStyleParser();

    return new EmbeddedCheckoutStylesheet(embeddedCheckoutStyleParser);
}
