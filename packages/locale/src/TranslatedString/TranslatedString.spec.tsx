import { createLanguageService } from '@bigcommerce/checkout-sdk';
import React from 'react';
import { create } from 'react-test-renderer';

import { LocaleContext } from '../contexts';

import TranslatedString from './TranslatedString';

describe('TranslatedString Component', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const language = createLanguageService();

    jest.spyOn(language, 'translate');

    it('renders translated string', () => {
        expect(
            create(
                <LocaleContext.Provider value={{ language }}>
                    <TranslatedString id="address.address_line_1_label" />
                </LocaleContext.Provider>,
            ).toJSON(),
        ).toMatchSnapshot();
    });

    it('calls language.translate', () => {
        expect(
            create(
                <LocaleContext.Provider value={{ language }}>
                    <TranslatedString id="address.address_line_1_label" />
                </LocaleContext.Provider>,
            ).toJSON(),
        ).toMatchSnapshot();

        expect(language.translate).toHaveBeenCalledWith('address.address_line_1_label', undefined);
    });

    it('calls language.translate with data when passed', () => {
        const data = { foo: 'xyz' };

        expect(
            create(
                <LocaleContext.Provider value={{ language }}>
                    <TranslatedString data={data} id="address.address_line_1_label" />
                </LocaleContext.Provider>,
            ).toJSON(),
        ).toMatchSnapshot();

        expect(language.translate).toHaveBeenCalledWith('address.address_line_1_label', data);
    });

    it('throws an error if component is not wrapped in correct provider', () => {
        const data = { foo: 'xyz' };
        let error;

        try {
            create(<TranslatedString data={data} id="address.address_line_1_label" />).toJSON();
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            error = err as Error;
        }

        expect(error?.message).toBe('useLocale must be used within a LocaleContextProvider');
    });
});
