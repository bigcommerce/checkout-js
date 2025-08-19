import { type CurrencyService } from "@bigcommerce/checkout-sdk";
import React from "react";

import { createLocaleContext, LocaleContext, type LocaleContextType } from "@bigcommerce/checkout/locale";
import { render, screen } from "@bigcommerce/checkout/test-utils";

import { getDigitalItem, getPhysicalItem } from "../cart/lineItem.mock";
import { getStoreConfig } from "../config/config.mock";
import { ShopperCurrency } from "../currency";

import OrderModalSummarySubheader from "./OrderModalSummarySubheader";

describe('OrderModalSummarySubheader', () => {
    let localeContext: LocaleContextType;
    let currencyService: CurrencyService;

    const items = {
        customItems: [],
        physicalItems: [getPhysicalItem()],
        digitalItems: [],
        giftCertificates: [],
    };

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        currencyService = localeContext.currency;
    });

    it('when shopper has same currency as the store and 1 item, text id passed is cart.item', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <OrderModalSummarySubheader
                    amountWithCurrency={<ShopperCurrency amount={100} />}
                    items={items}
                    shopperCurrencyCode="USD"
                    storeCurrencyCode="USD"
                />
            </LocaleContext.Provider>
        );

        expect(screen.getByText(`1 ${localeContext.language.translate('cart.item')} | ${currencyService.toCustomerCurrency(100)}`)).toBeInTheDocument();
    });

    it('when shopper has same currency as the store and multiple items, text id passed is cart.items', () => {
        const multipleItems = {
            ...items,
            digitalItems: [getDigitalItem()]
        };

        render(
            <LocaleContext.Provider value={localeContext}>
                <OrderModalSummarySubheader
                    amountWithCurrency={<ShopperCurrency amount={100} />}
                    items={multipleItems}
                    shopperCurrencyCode="USD"
                    storeCurrencyCode="USD"
                />
            </LocaleContext.Provider>
        );

        expect(screen.getByText(`2 ${localeContext.language.translate('cart.items')} | ${currencyService.toCustomerCurrency(100)}`)).toBeInTheDocument();
    });

    it('displays shopper currency in summary if different than store currency', () => {
        const shopperCurrencyCode = 'AUD';

        render(
            <LocaleContext.Provider value={localeContext}>
                <OrderModalSummarySubheader
                    amountWithCurrency={<ShopperCurrency amount={100} />}
                    items={items}
                    shopperCurrencyCode={shopperCurrencyCode}
                    storeCurrencyCode="USD"
                />
            </LocaleContext.Provider>
        );

        expect(screen.getByText(`1 ${localeContext.language.translate('cart.item')} | ${currencyService.toCustomerCurrency(100)}`)).toBeInTheDocument();
        expect(screen.getByText(`(${shopperCurrencyCode})`)).toBeInTheDocument();
    });
});
