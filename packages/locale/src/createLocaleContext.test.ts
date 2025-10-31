import { type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import createLocaleContext from './createLocaleContext';

describe('createLocaleContext', () => {
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('returns an object with currency', () => {
        expect(localeContext).toHaveProperty('currency');
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(localeContext.currency!.toStoreCurrency).toBeDefined();
    });

    it('returns an object with language', () => {
        expect(localeContext).toHaveProperty('language');
        expect(localeContext.language.translate).toBeDefined();
    });

    it('returns an object with date', () => {
        expect(localeContext).toHaveProperty('date');
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(localeContext.date!.inputFormat).toBeDefined();
    });
});
