import { mount } from 'enzyme';
import React from 'react';

import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import createLocaleContext from './createLocaleContext';
import LocaleContext, { LocaleContextType } from './LocaleContext';
import withLanguage from './withLanguage';

describe('withLanguage()', () => {
    let contextValue: LocaleContextType;

    beforeEach(() => {
        contextValue = createLocaleContext(getStoreConfig());
    });

    it('injects language service to inner component', () => {
        const Inner = () => <div />;
        const Outer = withLanguage(Inner);
        const container = mount(
            <LocaleContext.Provider value={contextValue}>
                <Outer />
            </LocaleContext.Provider>,
        );

        expect(container.find(Inner).prop('language')).toEqual(contextValue.language);
    });
});
