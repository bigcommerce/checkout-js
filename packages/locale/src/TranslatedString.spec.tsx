// import { createLanguageService, LanguageService } from '@bigcommerce/checkout-sdk';
import React from 'react';
import { create } from 'react-test-renderer';

import * as LocaleContext from './LocaleContext';
import { getLocaleContext } from './localeContext.mock';
import TranslatedString from './TranslatedString';

describe('TranslatedString Component', () => {
    it('renders translated string', () => {
        expect(
            create(<TranslatedString id="address.address_line_1_label" />).toJSON(),
        ).toMatchSnapshot();
    });

    const localeContext = getLocaleContext();

    jest.spyOn(LocaleContext, 'useLocale').mockImplementation(() => localeContext);

    const translateSpy = jest.spyOn(localeContext.language, 'translate');

    it('calls language.translate', () => {
        expect(create(<TranslatedString id="address.address_line_1_label" />).toJSON());

        expect(translateSpy).toHaveBeenCalledWith('address.address_line_1_label', undefined);
    });

    it('calls language.translate with data when passed', () => {
        const data = { foo: 'xyz' };

        expect(create(<TranslatedString data={data} id="address.address_line_1_label" />).toJSON());

        expect(translateSpy).toHaveBeenCalledWith('address.address_line_1_label', data);
    });
});
