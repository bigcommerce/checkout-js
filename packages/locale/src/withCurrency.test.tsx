import { render, screen } from '@testing-library/react';
import React, { type FunctionComponent } from 'react';

import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import createLocaleContext from './createLocaleContext';
import LocaleContext, { type LocaleContextType } from './LocaleContext';
import withCurrency, { type WithCurrencyProps } from './withCurrency';

describe('withCurrency()', () => {
    let contextValue: LocaleContextType;

    beforeEach(() => {
        contextValue = createLocaleContext(getStoreConfig());
    });

    it('injects currency service to inner component', () => {
        const Inner: FunctionComponent<WithCurrencyProps> = ({ currency }) => (
            <>{currency && currency.toStoreCurrency(1)}</>
        );
        const Outer = withCurrency(Inner);

        if (contextValue.currency) {
            contextValue.currency.toStoreCurrency = jest.fn(() => '$1.00');
        }

        render(
            <LocaleContext.Provider value={contextValue}>
                <Outer />
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('$1.00')).toBeInTheDocument();
    });
});
