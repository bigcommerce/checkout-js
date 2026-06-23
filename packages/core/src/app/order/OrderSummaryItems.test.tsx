import { type CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
    CheckoutProvider,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import {
    getCustomItem,
    getDigitalItem,
    getGiftCertificateItem,
    getPhysicalItem,
} from '../cart/lineItem.mock';
import { getStoreConfig } from '../config/config.mock';

import OrderSummaryItems, {
    type OrderSummaryItemsProps,
    setBackorderDetailsExpanded,
} from './OrderSummaryItems';

describe('OrderSummaryItems', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;

    const renderOrderSummaryItems = (props: OrderSummaryItemsProps) => {
        return render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <OrderSummaryItems {...props} />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );
    };

    const enableBundleExperiment = () => {
        const config = getStoreConfig();

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
            ...config,
            checkoutSettings: {
                ...config.checkoutSettings,
                features: {
                    ...config.checkoutSettings.features,
                    'BACK-425.update_bundle_item_ux': true,
                },
            },
            inventorySettings: {
                showQuantityOnBackorder: true,
                showBackorderMessage: true,
                showQuantityOnHand: false,
                showBackorderAvailabilityPrompt: false,
                backorderAvailabilityPrompt: null,
                showDefaultShippingExpectationPrompt: false,
                defaultShippingExpectationPrompt: null,
                shouldDisplayBackorderMessagesOnStorefront: true,
            },
        });
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            inventorySettings: {
                showQuantityOnBackorder: true,
                showBackorderMessage: true,
                showQuantityOnHand: false,
                showBackorderAvailabilityPrompt: false,
                backorderAvailabilityPrompt: null,
                showDefaultShippingExpectationPrompt: false,
                defaultShippingExpectationPrompt: null,
                shouldDisplayBackorderMessagesOnStorefront: true,
            },
        });
    });

    afterEach(() => {
        // The toggle selection is held in a module-scoped value so it can survive the
        // responsive remount; reset it between tests to avoid leaking state.
        setBackorderDetailsExpanded(false);
    });

    describe('backorder quantity text', () => {
        it('renders backorder details link when items have backorder quantities', () => {
            renderOrderSummaryItems({
                displayLineItemsCount: true,
                items: {
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
                },
            });

            expect(screen.getByTestId('cart-backorder-link')).toBeInTheDocument();
            expect(screen.getByTestId('cart-backorder-link')).toHaveTextContent(
                'Backorder details',
            );
        });

        it('renders backorder details link from physical items only when digital items have no backorders', () => {
            renderOrderSummaryItems({
                displayLineItemsCount: true,
                items: {
                    customItems: [],
                    physicalItems: [
                        {
                            ...getPhysicalItem(),
                            stockPosition: { quantityBackordered: 7 },
                        },
                    ],
                    digitalItems: [getDigitalItem()],
                    giftCertificates: [],
                },
            });

            expect(screen.getByTestId('cart-backorder-link')).toHaveTextContent(
                'Backorder details',
            );
        });

        it('does not render backorder details link when no items have backorder quantities', () => {
            renderOrderSummaryItems({
                displayLineItemsCount: true,
                items: {
                    customItems: [getCustomItem()],
                    physicalItems: [getPhysicalItem()],
                    digitalItems: [getDigitalItem()],
                    giftCertificates: [getGiftCertificateItem()],
                },
            });

            expect(screen.queryByTestId('cart-backorder-link')).not.toBeInTheDocument();
        });

        it('does not render backorder details link when stockPosition is undefined', () => {
            renderOrderSummaryItems({
                displayLineItemsCount: true,
                items: {
                    customItems: [],
                    physicalItems: [
                        {
                            ...getPhysicalItem(),
                            stockPosition: undefined,
                        },
                    ],
                    digitalItems: [],
                    giftCertificates: [],
                },
            });

            expect(screen.queryByTestId('cart-backorder-link')).not.toBeInTheDocument();
        });

        it('does not render backorder details link when quantityBackordered is zero', () => {
            renderOrderSummaryItems({
                displayLineItemsCount: true,
                items: {
                    customItems: [],
                    physicalItems: [
                        {
                            ...getPhysicalItem(),
                            stockPosition: { quantityBackordered: 0 },
                        },
                    ],
                    digitalItems: [],
                    giftCertificates: [],
                },
            });

            expect(screen.queryByTestId('cart-backorder-link')).not.toBeInTheDocument();
        });
    });

    describe('backorder details toggle gating (mobile vs desktop) and persistence', () => {
        const backorderItems = {
            customItems: [],
            physicalItems: [
                {
                    ...getPhysicalItem(),
                    stockPosition: { quantityBackordered: 3 },
                },
            ],
            digitalItems: [],
            giftCertificates: [],
        };

        // A bundle parent whose only backordered line is its child. With the experiment off the
        // child is stripped from display, so the backorder toggle would have nothing to show.
        const hiddenBundleChildBackordered = {
            customItems: [],
            physicalItems: [
                { ...getPhysicalItem(), id: '666' },
                {
                    ...getPhysicalItem(),
                    id: '777',
                    parentId: '666',
                    stockPosition: { quantityBackordered: 2 },
                },
            ],
            digitalItems: [],
            giftCertificates: [],
        };

        it('renders the toggle on desktop when the bundle experiment is off', () => {
            renderOrderSummaryItems({
                displayLineItemsCount: true,
                items: backorderItems,
            });

            expect(screen.getByTestId('cart-backorder-link')).toBeInTheDocument();
        });

        it('hides the toggle on the mobile cart modal when the bundle experiment is off', () => {
            renderOrderSummaryItems({
                displayLineItemsCount: false,
                isMobileCartModal: true,
                items: backorderItems,
            });

            expect(screen.queryByTestId('cart-backorder-link')).not.toBeInTheDocument();
            expect(screen.queryByTestId('cart-count-total')).not.toBeInTheDocument();
        });

        it('hides the toggle on the mobile cart modal when only hidden bundle children are backordered (experiment off)', () => {
            renderOrderSummaryItems({
                displayLineItemsCount: false,
                isMobileCartModal: true,
                items: hiddenBundleChildBackordered,
            });

            expect(screen.queryByTestId('cart-backorder-link')).not.toBeInTheDocument();
        });

        it('renders the toggle on the mobile cart modal when the bundle experiment is on', () => {
            enableBundleExperiment();

            renderOrderSummaryItems({
                displayLineItemsCount: false,
                isMobileCartModal: true,
                items: backorderItems,
            });

            expect(screen.getByTestId('cart-backorder-link')).toBeInTheDocument();
            expect(screen.queryByTestId('cart-count-total')).not.toBeInTheDocument();
        });

        it('defaults to off on a fresh mount', () => {
            renderOrderSummaryItems({
                displayLineItemsCount: true,
                items: backorderItems,
            });

            expect(screen.getByRole('switch')).not.toBeChecked();
        });

        it('persists the selection when the component is remounted across the breakpoint', async () => {
            // The mobile re-mount only shows the toggle while the bundle experiment is on.
            enableBundleExperiment();

            const { unmount } = renderOrderSummaryItems({
                displayLineItemsCount: true,
                items: backorderItems,
            });

            await userEvent.click(screen.getByRole('switch'));

            expect(screen.getByRole('switch')).toBeChecked();

            // Simulate the MobileView breakpoint swap: the current subtree unmounts and a
            // fresh instance (here the mobile variant) mounts in its place.
            unmount();

            renderOrderSummaryItems({
                displayLineItemsCount: false,
                isMobileCartModal: true,
                items: backorderItems,
            });

            expect(screen.getByRole('switch')).toBeChecked();
        });

        it('keeps line item details collapsed on the gated mobile modal even if previously expanded', async () => {
            // Turn the toggle on where it is available (desktop) so the module-scoped selection
            // persists as expanded.
            const { unmount } = renderOrderSummaryItems({
                displayLineItemsCount: true,
                items: backorderItems,
            });

            await userEvent.click(screen.getByRole('switch'));

            expect(screen.getByTestId('cart-item-backorder-qty')).toBeInTheDocument();

            unmount();

            // Mobile cart modal with the experiment off: the toggle is gated away, so the persisted
            // selection must NOT expand the line item details.
            renderOrderSummaryItems({
                displayLineItemsCount: false,
                isMobileCartModal: true,
                items: backorderItems,
            });

            expect(screen.queryByTestId('cart-backorder-link')).not.toBeInTheDocument();
            expect(screen.queryByTestId('cart-item-backorder-qty')).not.toBeInTheDocument();
        });
    });

    describe('backorder details for bundle items (pick-list experiment enabled)', () => {
        const bundleProps: OrderSummaryItemsProps = {
            displayLineItemsCount: true,
            items: {
                customItems: [],
                physicalItems: [
                    { ...getPhysicalItem(), id: '666' },
                    {
                        ...getPhysicalItem(),
                        id: '777',
                        name: 'Bundled Hat',
                        parentId: '666',
                        stockPosition: {
                            quantityBackordered: 2,
                            quantityOnHand: 3,
                            quantityOutOfStock: 0,
                            backorderMessage: 'Ships in 5 days',
                        },
                    },
                ],
                digitalItems: [],
                giftCertificates: [],
            },
        };

        it('renders the bundled child nested under its parent', () => {
            enableBundleExperiment();

            renderOrderSummaryItems(bundleProps);

            expect(screen.getByTestId('cart-item-bundled-item-name')).toHaveTextContent(
                'Bundled Hat',
            );
        });

        it('shows the bundled child backorder details when the toggle is turned on', async () => {
            enableBundleExperiment();

            renderOrderSummaryItems(bundleProps);

            // Collapsed by default — the backorder line is not mounted yet.
            expect(screen.queryByTestId('cart-item-backorder-qty')).not.toBeInTheDocument();

            await userEvent.click(screen.getByTestId('cart-backorder-link'));

            expect(screen.getByTestId('cart-item-backorder-qty')).toBeInTheDocument();
            expect(screen.getByTestId('cart-item-backorder-message')).toHaveTextContent(
                'Ships in 5 days',
            );
        });
    });

    describe('when it has 4 line items or less', () => {
        it('renders total count', () => {
            renderOrderSummaryItems({
                displayLineItemsCount: true,
                items: {
                    customItems: [getCustomItem()],
                    physicalItems: [getPhysicalItem()],
                    digitalItems: [getDigitalItem()],
                    giftCertificates: [getGiftCertificateItem()],
                },
            });

            expect(screen.getByTestId('cart-count-total')).toHaveTextContent('5 Items');
        });

        it('renders product list', () => {
            renderOrderSummaryItems({
                displayLineItemsCount: true,
                items: {
                    customItems: [getCustomItem()],
                    physicalItems: [getPhysicalItem()],
                    digitalItems: [getDigitalItem()],
                    giftCertificates: [getGiftCertificateItem()],
                },
            });

            expect(
                screen.getByRole('heading', { name: '1 x Canvas Laundry Cart' }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('heading', { name: '1 x $100 Gift Certificate' }),
            ).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: '1 x Digital Book' })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: '2 x Custom item' })).toBeInTheDocument();
        });

        it('does not render actions', () => {
            renderOrderSummaryItems({
                displayLineItemsCount: true,
                items: {
                    customItems: [getCustomItem()],
                    physicalItems: [getPhysicalItem()],
                    digitalItems: [getDigitalItem()],
                    giftCertificates: [getGiftCertificateItem()],
                },
            });

            expect(screen.queryByText('See All')).not.toBeInTheDocument();
        });
    });

    describe('when it has 5 line items or more', () => {
        const fiveOrMoreItemsProps: OrderSummaryItemsProps = {
            displayLineItemsCount: true,
            items: {
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
            },
        };

        it('renders actions and is collapsed by default', () => {
            const { container } = renderOrderSummaryItems(fiveOrMoreItemsProps);

            expect(screen.getByTestId('cart-count-total')).toHaveTextContent('6 Items');
            expect(screen.getByText('See All')).toBeInTheDocument();
            // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
            expect(container.querySelectorAll('.productList-item')).toHaveLength(4);
        });

        describe('when action is clicked', () => {
            it('shows the rest of the items', async () => {
                const { container } = renderOrderSummaryItems(fiveOrMoreItemsProps);

                await userEvent.click(screen.getByText('See All'));

                expect(screen.getByText('See Less')).toBeInTheDocument();
                // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
                expect(container.querySelectorAll('.productList-item')).toHaveLength(5);
            });

            describe('when action is clicked a second time', () => {
                it('collapses line items back', async () => {
                    const { container } = renderOrderSummaryItems(fiveOrMoreItemsProps);

                    await userEvent.click(screen.getByText('See All'));
                    await userEvent.click(screen.getByText('See Less'));

                    expect(screen.getByText('See All')).toBeInTheDocument();
                    expect(screen.queryByText('See Less')).not.toBeInTheDocument();
                    await waitFor(() => {
                        // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
                        expect(container.querySelectorAll('.productList-item')).toHaveLength(4);
                    });
                });
            });
        });

        describe('line items count is not rendered if flag is passed as false', () => {
            it('does not render line items count', () => {
                renderOrderSummaryItems({
                    displayLineItemsCount: false,
                    items: {
                        customItems: [getCustomItem()],
                        physicalItems: [getPhysicalItem()],
                        digitalItems: [getDigitalItem()],
                        giftCertificates: [getGiftCertificateItem()],
                    },
                });

                expect(screen.queryByTestId('cart-count-total')).not.toBeInTheDocument();
            });
        });
    });
});
