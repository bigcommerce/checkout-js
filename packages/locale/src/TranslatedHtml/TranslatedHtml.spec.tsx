import { createLanguageService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React from 'react';

import { LocaleContext, LocaleContextType } from '../contexts';

import TranslatedHtml from './TranslatedHtml';

describe('TranslatedHtml', () => {
    let context: LocaleContextType;

    beforeEach(() => {
        context = {
            language: createLanguageService({
                translations: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
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
        const component = mount(
            <LocaleContext.Provider value={context}>
                <TranslatedHtml id="abc" />
            </LocaleContext.Provider>,
        );

        expect(component.html()).toBe('<span><strong>abc</strong></span>');
    });

    it('sanitizes translated Html', () => {
        const component = mount(
            <LocaleContext.Provider value={context}>
                <TranslatedHtml id="dirty" />
            </LocaleContext.Provider>,
        );

        expect(component.html()).toBe('<span><img src="x"></span>');
    });

    it('allows anchor tags with target attribute', () => {
        const component = mount(
            <LocaleContext.Provider value={context}>
                <TranslatedHtml id="link" />
            </LocaleContext.Provider>,
        );

        expect(component.html()).toBe(
            '<span><a target="_blank" href="https://bigcommerce.com">Link</a></span>',
        );
    });
});
