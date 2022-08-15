import { createLanguageService } from '@bigcommerce/checkout-sdk';

import { NoopCheckoutSupport } from '../checkout';

import createEmbeddedCheckoutSupport from './createEmbeddedCheckoutSupport';
import EmbeddedCheckoutSupport from './EmbeddedCheckoutSupport';
import * as isEmbeddedModule from './isEmbedded';

describe('createEmbeddedCheckoutSupport()', () => {
    it('returns embedded checkout support if in embedded mode', () => {
        jest.spyOn(isEmbeddedModule, 'default').mockReturnValue(true);

        expect(createEmbeddedCheckoutSupport(createLanguageService())).toBeInstanceOf(
            EmbeddedCheckoutSupport,
        );
    });

    it('returns noop checkout support if not in embedded mode', () => {
        jest.spyOn(isEmbeddedModule, 'default').mockReturnValue(false);

        expect(createEmbeddedCheckoutSupport(createLanguageService())).toBeInstanceOf(
            NoopCheckoutSupport,
        );
    });
});
