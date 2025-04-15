import React from 'react';
import testRenderer from 'react-test-renderer';

import { getLocaleContext, LocaleContext  } from '@bigcommerce/checkout/locale';

import StoreCurrency from './StoreCurrency';

describe('ShopperCurrency Component', () => {
    const localeContext = getLocaleContext();

    it('renders formatted amount in shopper currency', () => {
        jest.spyOn(localeContext.currency, 'toStoreCurrency');

        const tree = testRenderer
            .create(
                <LocaleContext.Provider value={localeContext}>
                    <StoreCurrency amount={10} />
                </LocaleContext.Provider>,
            )
            .toJSON();

        expect(localeContext.currency.toStoreCurrency).toHaveBeenCalledWith(10);
        expect(tree).toMatchSnapshot();
    });
});
