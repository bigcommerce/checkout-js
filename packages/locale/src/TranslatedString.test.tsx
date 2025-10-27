import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/contexts';

import TranslatedString from './TranslatedString';

import { getLanguageService } from './index';

describe('TranslatedString', () => {
    const checkoutService = createCheckoutService();
    const languageService = getLanguageService();

    it('renders the translated string correctly', () => {
        render(
            <LocaleProvider checkoutService={checkoutService} languageService={languageService}>
                <TranslatedString id="address.address_line_1_label" />
            </LocaleProvider>,
        );

        expect(screen.getByText('Address')).toBeInTheDocument();
    });
});
