import { mount } from "enzyme";
import React from "react";

import { createLocaleContext, LocaleContext, LocaleContextType, TranslatedString } from "@bigcommerce/checkout/locale";

import { getDigitalItem, getPhysicalItem } from "../cart/lineItem.mock";
import { getStoreConfig } from "../config/config.mock";
import { ShopperCurrency } from "../currency";

import OrderModalSummarySubheader from "./OrderModalSummarySubheader";

describe('OrderModalSummarySubheader', () => {
    let localeContext: LocaleContextType;
    let orderModalSummarySubHeader: any;
    const items = {
        customItems: [],
        physicalItems: [getPhysicalItem()],
        digitalItems: [],
        giftCertificates: [],
    };

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('when shopper has same currency as the store and 1 item, text id passed is cart.item', () => {
        orderModalSummarySubHeader = mount(
            <LocaleContext.Provider value={localeContext}>
                <OrderModalSummarySubheader
                    amountWithCurrency={<ShopperCurrency amount={100} />}
                    items={items}
                    shopperCurrencyCode="USD"
                    storeCurrencyCode="USD"
                />
            </LocaleContext.Provider>
        );

        const currencyAmount = orderModalSummarySubHeader.find(ShopperCurrency);

        expect(orderModalSummarySubHeader.find(TranslatedString).props()).toMatchObject({
            id: 'cart.item',
        });

        expect(currencyAmount.text()).toBe('$112.00');
    });

    it('when shopper has same currency as the store and multiple items, text id passed is cart.items', () => {
        const multipleItems = {
            ...items,
            digitalItems: [getDigitalItem()]
        };

        orderModalSummarySubHeader = mount(
            <LocaleContext.Provider value={localeContext}>
                <OrderModalSummarySubheader
                    amountWithCurrency={<ShopperCurrency amount={100} />}
                    items={multipleItems}
                    shopperCurrencyCode="USD"
                    storeCurrencyCode="USD"
                />
            </LocaleContext.Provider>
        );

        const currencyAmount = orderModalSummarySubHeader.find(ShopperCurrency);

        expect(orderModalSummarySubHeader.find(TranslatedString).props()).toMatchObject({
            id: 'cart.items',
        });

        expect(currencyAmount.text()).toBe('$112.00');
    });

    it('displays shopper currency in summary if different than store currency', () => {
        const shopperCurrencyCode = 'AUD';

        orderModalSummarySubHeader = mount(
            <LocaleContext.Provider value={localeContext}>
                <OrderModalSummarySubheader
                    amountWithCurrency={<ShopperCurrency amount={100} />}
                    items={items}
                    shopperCurrencyCode={shopperCurrencyCode}
                    storeCurrencyCode="USD"
                />
            </LocaleContext.Provider>
        );

        expect(orderModalSummarySubHeader.find('span').text()).toBe(`(${shopperCurrencyCode})`);
    });
});