import { render, screen } from '@testing-library/react';
import React from 'react';

import LocaleContext from './LocaleContext';
import { getLocaleContext } from './localeContext.mock';
import TranslatedString from './TranslatedString';

describe('TranslatedString', () => {
    const localeContext = getLocaleContext();

    jest.spyOn(localeContext.language, 'translate');

    it('renders the translated string correctly', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <TranslatedString id="address.address_line_1_label" />
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('Address')).toBeInTheDocument();
    });
});
