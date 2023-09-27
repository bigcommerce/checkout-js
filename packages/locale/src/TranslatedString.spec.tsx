import React from 'react';
import testRenderer from 'react-test-renderer';

import LocaleContext from './LocaleContext';
import { getLocaleContext } from './localeContext.mock';
import TranslatedString from './TranslatedString';

describe('TranslatedString Component', () => {
    const localeContext = getLocaleContext();

    jest.spyOn(localeContext.language, 'translate');

    it('renders translated string', () => {
        expect(
            testRenderer
                .create(
                    <LocaleContext.Provider value={localeContext}>
                        <TranslatedString id="address.address_line_1_label" />
                    </LocaleContext.Provider>,
                )
                .toJSON(),
        ).toMatchSnapshot();
    });

    it('calls language.translate', () => {
        expect(
            testRenderer
                .create(
                    <LocaleContext.Provider value={localeContext}>
                        <TranslatedString id="address.address_line_1_label" />
                    </LocaleContext.Provider>,
                )
                .toJSON(),
        );

        expect(localeContext.language.translate).toHaveBeenCalledWith(
            'address.address_line_1_label',
            undefined,
        );
    });

    it('calls language.translate with data when passed', () => {
        const data = { foo: 'xyz' };

        expect(
            testRenderer
                .create(
                    <LocaleContext.Provider value={localeContext}>
                        <TranslatedString data={data} id="address.address_line_1_label" />
                    </LocaleContext.Provider>,
                )
                .toJSON(),
        );

        expect(localeContext.language.translate).toHaveBeenCalledWith(
            'address.address_line_1_label',
            data,
        );
    });
});
