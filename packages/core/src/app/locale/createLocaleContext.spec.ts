import { getStoreConfig } from '../config/config.mock';

import createLocaleContext from './createLocaleContext';
import { LocaleContextType } from './LocaleContext';

describe('createLocaleContext', () => {
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('returns an object with currency', () => {
        expect(localeContext).toHaveProperty('currency');
        // tslint:disable-next-line:no-non-null-assertion
        expect(localeContext.currency!.toStoreCurrency).toBeDefined();
    });

    it('returns an object with language', () => {
        expect(localeContext).toHaveProperty('language');
        expect(localeContext.language.translate).toBeDefined();
    });

    it('returns an object with date', () => {
        expect(localeContext).toHaveProperty('date');
        // tslint:disable-next-line:no-non-null-assertion
        expect(localeContext.date!.inputFormat).toBeDefined();
    });
});
