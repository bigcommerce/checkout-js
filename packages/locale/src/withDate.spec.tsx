import { mount } from 'enzyme';
import React from 'react';

import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import createLocaleContext from './createLocaleContext';
import LocaleContext, { LocaleContextType } from './LocaleContext';
import withDate from './withDate';

describe('withDate()', () => {
    let contextValue: Required<LocaleContextType>;

    beforeEach(() => {
        contextValue = createLocaleContext(getStoreConfig());
    });

    it('injects date prop to inner component', () => {
        const Inner = () => <div />;
        const Outer = withDate(Inner);
        const container = mount(
            <LocaleContext.Provider value={contextValue}>
                <Outer />
            </LocaleContext.Provider>,
        );

        expect(container.find(Inner).prop('date')).toEqual(contextValue.date);
    });
});
