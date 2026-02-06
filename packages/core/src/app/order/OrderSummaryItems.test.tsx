import { expect } from '@playwright/test';
import userEvent from '@testing-library/user-event';
import React, { type FunctionComponent } from 'react';

import { LocaleContext, type LocaleContextType, useCheckout } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import {
    getCustomItem,
    getDigitalItem,
    getGiftCertificateItem,
    getPhysicalItem,
} from '../cart/lineItem.mock';
import { getStoreConfig } from '../config/config.mock';

import OrderSummaryItems, { type OrderSummaryItemsProps } from './OrderSummaryItems';

jest.mock('@bigcommerce/checkout/contexts', () => ({
    ...jest.requireActual('@bigcommerce/checkout/contexts'),
    useCheckout: jest.fn(),
}));

describe('OrderSummaryItems', () => {
    const mockUseCheckout = useCheckout as jest.Mock;

    beforeEach(() => {
        mockUseCheckout.mockReturnValue({
            checkoutState: {
                data: {
                    getConfig: () => ({
                        inventorySettings: {
                            shouldDisplayBackorderMessagesOnStorefront: true,
                        },
                    }),
                },
            },
        });
    });
    describe('backorder quantity text', () => {
        it('renders backorder count when items have backorder quantities', () => {
            render(
                <OrderSummaryItems
                    displayLineItemsCount
                    items={{
                        customItems: [],
                        physicalItems: [
                            {
                                ...getPhysicalItem(),
                                stockPosition: { quantityBackordered: 3 },
                            },
                        ],
                        digitalItems: [
                            {
                                ...getDigitalItem(),
                                stockPosition: { quantityBackordered: 2 },
                            },
                        ],
                        giftCertificates: [],
                    }}
                />,
            );

            expect(screen.getByTestId('cart-backorder-total')).toBeInTheDocument();
            expect(screen.getByTestId('cart-backorder-total')).toHaveTextContent('5 will be backordered');
        });

        it('renders backorder count from physical items only when digital items have no backorders', () => {
            render(
                <OrderSummaryItems
                    displayLineItemsCount
                    items={{
                        customItems: [],
                        physicalItems: [
                            {
                                ...getPhysicalItem(),
                                stockPosition: { quantityBackordered: 7 },
                            },
                        ],
                        digitalItems: [getDigitalItem()],
                        giftCertificates: [],
                    }}
                />,
            );

            expect(screen.getByTestId('cart-backorder-total')).toHaveTextContent('7 will be backordered');
        });

        it('does not render backorder count when no items have backorder quantities', () => {
            render(
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

            expect(screen.queryByTestId('cart-backorder-total')).not.toBeInTheDocument();
        });

        it('does not render backorder count when stockPosition is undefined', () => {
            render(
                <OrderSummaryItems
                    displayLineItemsCount
                    items={{
                        customItems: [],
                        physicalItems: [
                            {
                                ...getPhysicalItem(),
                                stockPosition: undefined,
                            },
                        ],
                        digitalItems: [],
                        giftCertificates: [],
                    }}
                />,
            );

            expect(screen.queryByTestId('cart-backorder-total')).not.toBeInTheDocument();
        });

        it('does not render backorder count when quantityBackordered is zero', () => {
            render(
                <OrderSummaryItems
                    displayLineItemsCount
                    items={{
                        customItems: [],
                        physicalItems: [
                            {
                                ...getPhysicalItem(),
                                stockPosition: { quantityBackordered: 0 },
                            },
                        ],
                        digitalItems: [],
                        giftCertificates: [],
                    }}
                />,
            );

            expect(screen.queryByTestId('cart-backorder-total')).not.toBeInTheDocument();
        });
    });

    describe('when it has 4 line items or less', () => {
        it('renders total count', () => {
            render(
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

            expect(screen.getByTestId('cart-count-total')).toHaveTextContent('5 Items');
        });

        it('renders product list', () => {
            render(
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

            expect(screen.getAllByTestId('cart-item-product-title')).toHaveLength(4);
            expect(screen.getByText('1 x Canvas Laundry Cart')).toBeInTheDocument();
            expect(screen.getByText('1 x $100 Gift Certificate')).toBeInTheDocument();
            expect(screen.getByText('1 x Digital Book')).toBeInTheDocument();
            expect(screen.getByText('2 x Custom item')).toBeInTheDocument();
        });

        it('does not render actions', () => {
            render(
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

            expect(screen.queryByText('See All')).not.toBeInTheDocument();
        });
    });

    describe('when it has 5 line items or more', () => {
        let localeContext: LocaleContextType;
        let OrderSummaryItemsTest: FunctionComponent<OrderSummaryItemsProps>;

        beforeEach(() => {
            localeContext = createLocaleContext(getStoreConfig());
            OrderSummaryItemsTest = () => (
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
                </LocaleContext.Provider>
            );
        })

        it('renders actions and is collapsed by default', () => {
            const { container } = render(<OrderSummaryItemsTest />);

            expect(screen.getByTestId('cart-count-total')).toHaveTextContent('6 Items');
            expect(screen.getByText('See All')).toBeInTheDocument();
            // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
            expect(container.querySelectorAll('.productList-item')).toHaveLength(4);
        });

        describe('when action is clicked', () => {

            it('shows the rest of the items', async () => {
                const { container } = render(<OrderSummaryItemsTest />);

                await userEvent.click(screen.getByText('See All'));

                expect(screen.getByText('See Less')).toBeInTheDocument();
                // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
                expect(container.querySelectorAll('.productList-item')).toHaveLength(5);
            });

            describe('when action is clicked a second time', () => {
                it('collapses line items back', async () => {
                    const { container } = render(<OrderSummaryItemsTest />);

                    await userEvent.click(screen.getByText('See All'));
                    await userEvent.click(screen.getByText('See Less'));

                    expect(screen.getByText('See All')).toBeInTheDocument();
                    expect(screen.queryByText('See Less')).not.toBeInTheDocument();
                    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
                    expect(container.querySelectorAll('.productList-item')).toHaveLength(4);
                });
            });
        });

        describe('line items count is not rendered if flag is passed as false', () => {
            it('does not render line items count', () => {
                render(
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

                expect(screen.queryByTestId('cart-count-total')).not.toBeInTheDocument();
            });
        });
    });
});
