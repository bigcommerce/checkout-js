import { mount } from 'enzyme';
import React from 'react';

import { getStoreConfig } from '../config/config.mock';

import createLocaleContext from './createLocaleContext';
import withCurrency from './withCurrency';
import LocaleContext, { LocaleContextType } from './LocaleContext';

describe('withCurrency()', () => {
    let contextValue: LocaleContextType;

    beforeEach(() => {
        contextValue = createLocaleContext(getStoreConfig());
    });

    it('injects currency service to inner component', () => {
        const Inner = () => <div />;
        const Outer = withCurrency(Inner);
        const container = mount(
            <LocaleContext.Provider value={ contextValue }>
                <Outer />
            </LocaleContext.Provider>
        );

        expect(container.find(Inner).prop('currency'))
            .toEqual(contextValue.currency);
    });
});
