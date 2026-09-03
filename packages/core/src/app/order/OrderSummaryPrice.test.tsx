import { noop } from 'lodash';
import React, { type ReactNode } from 'react';

import * as contexts from '@bigcommerce/checkout/contexts';
import { act, fireEvent, render, screen, within } from '@bigcommerce/checkout/test-utils';

jest.mock('react-transition-group', () => ({
    CSSTransition: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../currency', () => ({
    ShopperCurrency: ({ amount }: { amount: number }) => (
        <div data-test="ShopperCurrency">{amount}</div>
    ),
}));

import OrderSummaryPrice, { type OrderSummaryPriceProps } from './OrderSummaryPrice';

describe('OrderSummaryPrice', () => {
    const useCheckoutMock = (isSubmittingOrder: boolean) => {
        jest.spyOn(contexts, 'useCheckout').mockImplementation(
            jest.fn().mockImplementation(() => ({
                checkoutState: {
                    data: { getConfig: noop },
                    statuses: {
                        isSubmittingOrder: () => isSubmittingOrder,
                    },
                },
                selectedState: isSubmittingOrder,
            })),
        );
    };

    const buildTestComponent = (
        props: OrderSummaryPriceProps & { children?: ReactNode },
        { enhancedThemeV1 = false }: { enhancedThemeV1?: boolean } = {},
    ) => (
        <contexts.ThemeContext.Provider value={{ enhancedThemeV1 }}>
            <OrderSummaryPrice {...props} />
        </contexts.ThemeContext.Provider>
    );

    const renderTestComponent = (
        props: OrderSummaryPriceProps & { children?: ReactNode },
        options: { enhancedThemeV1?: boolean } = {},
    ) => {
        return render(buildTestComponent(props, options));
    };

    describe('when has non-zero amount', () => {
        const amount = 10;

        beforeEach(() => {
            useCheckoutMock(false);
        });

        describe('and has only required props', () => {
            it('renders component', () => {
                const { baseElement } = renderTestComponent({
                    amount,
                    label: 'Label',
                    children: 'Foo Children',
                });

                expect(baseElement).toMatchSnapshot();
            });
        });

        describe('and has only required props', () => {
            it('renders additional elements/props', () => {
                const { baseElement } = renderTestComponent({
                    amount,
                    className: 'extra-class',
                    currencyCode: 'EUR',
                    label: 'Label',
                    superscript: 'superscript',
                    testId: 'test-id',
                });

                expect(baseElement).toMatchSnapshot();

                expect(screen.getByText('(EUR)')).toBeInTheDocument();
                expect(screen.getByTestId('cart-price-value-superscript')).toHaveTextContent(
                    'superscript',
                );
            });
        });
    });

    describe('when has null amount', () => {
        it('renders not yet symbol as label', () => {
            renderTestComponent({
                amount: null,
                label: 'Label',
            });

            expect(screen.getByTestId('cart-price-value')).toHaveTextContent('--');
        });
    });

    describe('when has zero amount', () => {
        const amount = 0;

        describe('and no label', () => {
            it('renders formatted amount', () => {
                renderTestComponent({
                    amount,
                    className: 'label',
                    label: 'Label',
                    testId: 'test',
                });

                expect(screen.getByTestId('ShopperCurrency')).toHaveTextContent('0');
            });
        });

        describe('and zero label', () => {
            it('renders zero label', () => {
                renderTestComponent({
                    amount,
                    className: 'label',
                    label: 'Label',
                    testId: 'test',
                    zeroLabel: 'Free',
                });

                expect(screen.getByTestId('cart-price-value')).toHaveTextContent('Free');
            });
        });
    });

    describe('when amount changes', () => {
        const initialProps: OrderSummaryPriceProps = {
            amount: 10,
            label: 'Label',
            superscript: '*',
            testId: 'test-id',
        };

        beforeEach(() => {
            useCheckoutMock(false);
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('slides the old price out, shows dots, then slides the new price in', () => {
            const props = { ...initialProps, amountBeforeDiscount: 20 };
            const { rerender } = renderTestComponent(props, { enhancedThemeV1: true });

            expect(screen.queryByTestId('loading-dots')).not.toBeInTheDocument();

            rerender(buildTestComponent({ ...props, amount: 15 }, { enhancedThemeV1: true }));

            const priceValue = screen.getByTestId('cart-price-value');
            const priceRow = priceValue.closest('.cart-priceItem');

            expect(screen.getByTestId('price-ticker')).toHaveClass('priceTicker-exit');
            expect(within(priceValue).getByTestId('ShopperCurrency')).toHaveTextContent('10');
            expect(screen.getByTestId('cart-price-value-superscript')).toBeInTheDocument();
            expect(priceRow).toHaveAttribute('aria-busy', 'true');

            act(() => {
                jest.advanceTimersByTime(200);
            });

            expect(screen.getByTestId('loading-dots')).toBeInTheDocument();
            expect(priceValue).toContainElement(screen.getByTestId('loading-dots'));
            expect(screen.queryByTestId('ShopperCurrency')).not.toBeInTheDocument();
            expect(screen.queryByTestId('cart-price-value-superscript')).not.toBeInTheDocument();
            expect(priceRow).toHaveAttribute('aria-busy', 'true');

            act(() => {
                jest.advanceTimersByTime(1200);
            });

            expect(screen.queryByTestId('loading-dots')).not.toBeInTheDocument();
            expect(screen.getByTestId('price-ticker')).toHaveClass('priceTicker-enter');
            expect(within(priceValue).getByTestId('ShopperCurrency')).toHaveTextContent('15');
            expect(screen.getByTestId('cart-price-value-superscript')).toBeInTheDocument();

            act(() => {
                jest.advanceTimersByTime(200);
            });

            expect(screen.queryByTestId('price-ticker')).not.toBeInTheDocument();
            expect(priceRow).not.toHaveAttribute('aria-busy');
            expect(screen.getByTestId('cart-price-value-superscript')).toHaveTextContent('*');
        });

        it('recovers to the new price when the amount becomes unavailable mid-animation', () => {
            const { rerender } = renderTestComponent(initialProps, { enhancedThemeV1: true });

            rerender(
                buildTestComponent({ ...initialProps, amount: null }, { enhancedThemeV1: true }),
            );

            act(() => {
                jest.advanceTimersByTime(600);
            });

            expect(screen.getByTestId('loading-dots')).toBeInTheDocument();

            rerender(
                buildTestComponent({ ...initialProps, amount: 25 }, { enhancedThemeV1: true }),
            );

            expect(screen.queryByTestId('loading-dots')).not.toBeInTheDocument();
            expect(screen.getByTestId('ShopperCurrency')).toHaveTextContent('25');

            act(() => {
                jest.advanceTimersByTime(5000);
            });

            expect(screen.queryByTestId('loading-dots')).not.toBeInTheDocument();
        });

        it('skips the animation when the user prefers reduced motion', () => {
            (window.matchMedia as jest.Mock).mockReturnValueOnce({
                matches: true,
                addListener: noop,
                addEventListener: noop,
                removeListener: noop,
                removeEventListener: noop,
            });

            const { rerender } = renderTestComponent(initialProps, { enhancedThemeV1: true });

            rerender(
                buildTestComponent({ ...initialProps, amount: 15 }, { enhancedThemeV1: true }),
            );

            expect(screen.queryByTestId('loading-dots')).not.toBeInTheDocument();
            expect(screen.queryByTestId('price-ticker')).not.toBeInTheDocument();
            expect(screen.getByTestId('ShopperCurrency')).toHaveTextContent('15');
        });

        it('does not animate the initial amount population', () => {
            const { rerender } = renderTestComponent(
                { ...initialProps, amount: null },
                { enhancedThemeV1: true },
            );

            rerender(
                buildTestComponent({ ...initialProps, amount: 10 }, { enhancedThemeV1: true }),
            );

            expect(screen.queryByTestId('loading-dots')).not.toBeInTheDocument();
            expect(screen.queryByTestId('price-ticker')).not.toBeInTheDocument();
            expect(screen.getByTestId('ShopperCurrency')).toHaveTextContent('10');
        });

        it('restarts the animation when the amount changes again mid-animation', () => {
            const { rerender } = renderTestComponent(initialProps, { enhancedThemeV1: true });

            rerender(
                buildTestComponent({ ...initialProps, amount: 15 }, { enhancedThemeV1: true }),
            );

            act(() => {
                jest.advanceTimersByTime(800);
            });

            expect(screen.getByTestId('loading-dots')).toBeInTheDocument();

            rerender(
                buildTestComponent({ ...initialProps, amount: 25 }, { enhancedThemeV1: true }),
            );

            expect(screen.queryByTestId('loading-dots')).not.toBeInTheDocument();
            expect(screen.getByTestId('price-ticker')).toHaveClass('priceTicker-exit');

            act(() => {
                jest.advanceTimersByTime(1600);
            });

            expect(screen.queryByTestId('loading-dots')).not.toBeInTheDocument();
            expect(screen.queryByTestId('price-ticker')).not.toBeInTheDocument();
            expect(screen.getByTestId('ShopperCurrency')).toHaveTextContent('25');
        });

        it('renders the price without dots in non-enhanced theme', () => {
            const { rerender } = renderTestComponent(initialProps);

            rerender(buildTestComponent({ ...initialProps, amount: 15 }));

            expect(screen.queryByTestId('loading-dots')).not.toBeInTheDocument();
            expect(screen.getByTestId('ShopperCurrency')).toHaveTextContent('15');
        });
    });

    describe('price action button', () => {
        const amount = 10;
        let onActionTriggered: () => void;
        let actionLabel: string;

        beforeEach(() => {
            onActionTriggered = jest.fn();
            actionLabel = 'Action Label';
        });

        it('should show price action button', () => {
            renderTestComponent({
                amount,
                className: 'label',
                label: 'Label',
                testId: 'test',
                onActionTriggered,
                actionLabel,
            });

            const actionButton = screen.getByTestId('cart-price-callback');

            expect(actionButton).toBeInTheDocument();
            expect(actionButton).toHaveTextContent(actionLabel);

            fireEvent.click(actionButton);

            expect(onActionTriggered).toHaveBeenCalled();
        });

        it('should not show price action button if no callback for this action', () => {
            renderTestComponent({
                amount,
                className: 'label',
                label: 'Label',
                testId: 'test',
                onActionTriggered: undefined,
                actionLabel,
            });

            expect(screen.queryByTestId('cart-price-callback')).not.toBeInTheDocument();
        });

        it('should not show price action button if no label for this button', () => {
            renderTestComponent({
                amount,
                className: 'label',
                label: 'Label',
                testId: 'test',
                onActionTriggered,
                actionLabel: undefined,
            });

            expect(screen.queryByTestId('cart-price-callback')).not.toBeInTheDocument();
        });

        it('should not show price action button while submitting payment', () => {
            useCheckoutMock(true);

            renderTestComponent({
                amount,
                className: 'label',
                label: 'Label',
                testId: 'test',
                onActionTriggered,
                actionLabel,
            });

            const actionButton = screen.getByTestId('cart-price-callback');

            expect(actionButton).toBeInTheDocument();
            expect(actionButton).toHaveTextContent(actionLabel);

            fireEvent.click(actionButton);

            expect(onActionTriggered).not.toHaveBeenCalled();
        });
    });
});
