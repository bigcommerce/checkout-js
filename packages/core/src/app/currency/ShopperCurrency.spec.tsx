import React from 'react';
import testRenderer from 'react-test-renderer';

import { getLocaleContext, LocaleContext  } from '@bigcommerce/checkout/locale';

import ShopperCurrency from './ShopperCurrency';

describe('ShopperCurrency Component', () => {
    const localeContext = getLocaleContext();

    it('renders formatted amount in shopper currency', () => {
        const currency = localeContext.currency;

        jest.spyOn(currency, 'toCustomerCurrency');

        const tree = testRenderer
            .create(
                <LocaleContext.Provider value={localeContext}>
                    <ShopperCurrency amount={10} />
                </LocaleContext.Provider>,
            )
            .toJSON();

        expect(currency.toCustomerCurrency).toHaveBeenCalledWith(10);
        expect(tree).toMatchSnapshot();
    });
});
