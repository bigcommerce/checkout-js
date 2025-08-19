import { createCurrencyService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import LocaleContext, { type LocaleContextType } from './LocaleContext';
import TranslatedHtml from './TranslatedHtml';

describe('TranslatedHtml', () => {
    let context: LocaleContextType;

    beforeEach(() => {
        context = {
            currency: createCurrencyService(getStoreConfig()),
            language: createLanguageService({
                translations: {
                    optimized_checkout: {
                        abc: '<strong>abc</strong>',
                        link: '<a href="https://bigcommerce.com" target="_blank" onclick="alert(1)">Link</strong>',
                        dirty: '<img src=x onerror=alert(1)//>',
                    },
                },
            }),
        };
    });

    it('renders translated Html', () => {
        render(
            <LocaleContext.Provider value={context}>
                <TranslatedHtml id="abc" />
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('abc')).toBeInTheDocument();
    });

    it('sanitizes translated Html', () => {
        render(
            <LocaleContext.Provider value={context}>
                <TranslatedHtml id="dirty" />
            </LocaleContext.Provider>,
        );

        const image = screen.getByRole('img');

        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'x');
    });

    it('allows anchor tags with target', () => {
        render(
            <LocaleContext.Provider value={context}>
                <TranslatedHtml id="link" />
            </LocaleContext.Provider>,
        );

        const link = screen.getByRole('link', { name: 'Link' });

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://bigcommerce.com');
    });
});
