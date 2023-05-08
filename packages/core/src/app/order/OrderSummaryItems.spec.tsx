import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType, TranslatedString } from '@bigcommerce/checkout/locale';

import {
    getCustomItem,
    getDigitalItem,
    getGiftCertificateItem,
    getPhysicalItem,
} from '../cart/lineItem.mock';
import { getStoreConfig } from '../config/config.mock';

import OrderSummaryItems from './OrderSummaryItems';

describe('OrderSummaryItems', () => {
    describe('when it has 4 line items or less', () => {
        let orderSummaryItems: ShallowWrapper;

        beforeEach(() => {
            orderSummaryItems = shallow(
                <OrderSummaryItems
                    displayLineItemsCount
                    items={{
                        customItems: [getCustomItem()],
                        physicalItems: [getPhysicalItem()],
                        digitalItems: [getDigitalItem()],
                        giftCertificates: [getGiftCertificateItem()],
                    }}
                />,
            );
        });

        it('renders total count', () => {
            expect(orderSummaryItems.find(TranslatedString).props()).toMatchObject({
                id: 'cart.item_count_text',
                data: { count: 5 },
            });
        });

        it('renders product list', () => {
            expect(orderSummaryItems.find('.productList')).toMatchSnapshot();
        });

        it('does not render actions', () => {
            expect(orderSummaryItems.find('.cart-actions')).toHaveLength(0);
        });
    });

    describe('when it has 5 line items or more', () => {
        let localeContext: LocaleContextType;
        let orderSummaryItems: ReactWrapper;

        beforeEach(() => {
            localeContext = createLocaleContext(getStoreConfig());

            orderSummaryItems = mount(
                <LocaleContext.Provider value={localeContext}>
                    <OrderSummaryItems
                        displayLineItemsCount
                        items={{
                            customItems: [getCustomItem()],
                            physicalItems: [
                                {
                                    ...getPhysicalItem(),
                                    id: '664',
                                },
                                getPhysicalItem(),
                            ],
                            digitalItems: [getDigitalItem()],
                            giftCertificates: [getGiftCertificateItem()],
                        }}
                    />
                </LocaleContext.Provider>,
            );
        });

        it('renders actions', () => {
            expect(orderSummaryItems.find('.cart-actions')).toHaveLength(1);
        });

        it('is collapsed by default', () => {
            expect(orderSummaryItems.find('.cart-actions').text()).toMatch('See All');

            expect(orderSummaryItems.find('.productList-item')).toHaveLength(4);
        });

        describe('when action is clicked', () => {
            beforeEach(() => {
                orderSummaryItems.find('.cart-actions button').simulate('click');
            });

            it('shows the rest of the items', () => {
                expect(orderSummaryItems.find('.cart-actions').text()).toMatch('See Less');

                expect(orderSummaryItems.find('.productList-item')).toHaveLength(5);
            });

            describe('when action is clicked a second time', () => {
                beforeEach(() => {
                    orderSummaryItems.find('.cart-actions button').simulate('click');
                });

                it('collapses line items back', () => {
                    expect(orderSummaryItems.find('.cart-actions').text()).toMatch('See All');

                    expect(orderSummaryItems.find('.productList-item')).toHaveLength(4);
                });
            });
        });

        describe('line items count is not rendered if flag is passed as false', () => {
            it('does not render line items count', () => {
                const orderSummaryItemsWithoutCount = shallow(
                    <OrderSummaryItems
                        displayLineItemsCount={false}
                        items={{
                            customItems: [getCustomItem()],
                            physicalItems: [getPhysicalItem()],
                            digitalItems: [getDigitalItem()],
                            giftCertificates: [getGiftCertificateItem()],
                        }}
                    />,
                );

                expect(orderSummaryItemsWithoutCount.find(TranslatedString)).toHaveLength(0);
            });
        });
    });
});
