import { createLanguageService } from '@bigcommerce/checkout-sdk';

import EmbeddedCheckoutSupport from './EmbeddedCheckoutSupport';
import { EmbeddedCheckoutUnsupportedError } from './errors';

describe('EmbeddedCheckoutSupport', () => {
    let embeddedCheckoutSupport: EmbeddedCheckoutSupport;

    beforeEach(() => {
        embeddedCheckoutSupport = new EmbeddedCheckoutSupport(
            ['foo', 'bar'],
            createLanguageService(),
        );
    });

    it('throws error if one of methods is unsupported', () => {
        expect(() => embeddedCheckoutSupport.isSupported('foo', 'hello')).toThrow(
            EmbeddedCheckoutUnsupportedError,
        );
    });

    it('does not throw error if supported method is passed', () => {
        expect(() => embeddedCheckoutSupport.isSupported('hello')).not.toThrow(
            EmbeddedCheckoutUnsupportedError,
        );
    });
});
