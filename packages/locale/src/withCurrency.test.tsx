import { render, screen } from '@testing-library/react';
import React, { type FunctionComponent } from 'react';

import { LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { getLocaleContext } from '@bigcommerce/checkout/test-mocks';

import withCurrency, { type WithCurrencyProps } from './withCurrency';

describe('withCurrency()', () => {
    let contextValue: LocaleContextType;

    beforeEach(() => {
        contextValue = getLocaleContext();
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
