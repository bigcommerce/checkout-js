import React, { ReactNode } from 'react';

import * as paymentIntegrationApi from '@bigcommerce/checkout/payment-integration-api';
import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

jest.mock('react-transition-group', () => ({
    CSSTransition: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../currency', () => ({
    ShopperCurrency: ({ amount }: {amount: number}) => <div data-test="ShopperCurrency">{amount}</div>
}));

import OrderSummaryPrice, { OrderSummaryPriceProps } from './OrderSummaryPrice';

describe('OrderSummaryPrice', () => {
    const useCheckoutMock = (isSubmittingOrder: boolean) => {
        jest.spyOn(paymentIntegrationApi, 'useCheckout').mockImplementation(
            jest.fn().mockImplementation(() => ({
                checkoutState: {
                    statuses: {
                        isSubmittingOrder: () => isSubmittingOrder,
                    }
                }
            }))
        );
    };

    const renderTestComponent = (
        props: OrderSummaryPriceProps & { children?: ReactNode }
    ) => {
        return render(<OrderSummaryPrice {...props} />);
    }

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
                expect(screen.getByTestId('cart-price-value-superscript')).toHaveTextContent('superscript');
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
