import { createCurrencyService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React from 'react';

import { getStoreConfig } from '@bigcommerce/checkout/test-utils';

import * as LocaleContext from './LocaleContext';
import { TranslatedHtmlWithContext as TranslatedHtml } from './TranslatedHtml';

describe('TranslatedHtml', () => {
    let context: LocaleContext.LocaleContextType;

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

        jest.spyOn(LocaleContext, 'useLocale').mockImplementation(() => context);
    });

    it('renders translated Html', () => {
        const component = mount(<TranslatedHtml id="abc" />);

        expect(component.html()).toBe('<span><strong>abc</strong></span>');
    });

    it('sanitizes translated Html', () => {
        const component = mount(<TranslatedHtml id="dirty" />);

        expect(component.html()).toBe('<span><img src="x"></span>');
    });

    it('allows anchor tags with target attribute', () => {
        const component = mount(<TranslatedHtml id="link" />);

        expect(component.html()).toBe(
            '<span><a target="_blank" href="https://bigcommerce.com">Link</a></span>',
        );
    });
});
