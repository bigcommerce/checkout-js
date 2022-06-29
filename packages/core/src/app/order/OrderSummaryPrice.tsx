import classNames from 'classnames';
import React, { Component, ReactNode } from 'react';
import { CSSTransition } from 'react-transition-group';

import { preventDefault } from '../common/dom';
import { ShopperCurrency } from '../currency';

export interface OrderSummaryPriceProps {
    label: ReactNode;
    amount?: number | null;
    zeroLabel?: ReactNode;
    className?: string;
    testId?: string;
    currencyCode?: string;
    superscript?: string;
    actionLabel?: ReactNode;
    onActionTriggered?(): void;
}

export interface OrderSummaryPriceState {
    highlight: boolean;
    previousAmount?: number;
}

function getDisplayValue(amount?: number | null, zeroLabel?: ReactNode): ReactNode | number {
    const notYetSetSymbol = '--';

    if (typeof amount === 'undefined' || amount === null) {
        return notYetSetSymbol;
    }

    if (zeroLabel && amount === 0) {
        return zeroLabel;
    }

    return amount;
}

function isNumberValue(displayValue: number | ReactNode): displayValue is number {
    return typeof displayValue === 'number';
}

class OrderSummaryPrice extends Component<OrderSummaryPriceProps, OrderSummaryPriceState> {
    static getDerivedStateFromProps(props: OrderSummaryPriceProps, state: OrderSummaryPriceState) {
        return {
            highlight: props.amount !== state.previousAmount,
            previousAmount: props.amount,
        };
    }

    state = {
        highlight: false,
        previousAmount: 0,
    };

    render(): ReactNode {
        const {
            amount,
            actionLabel,
            onActionTriggered,
            children,
            className,
            currencyCode,
            label,
            superscript,
            testId,
            zeroLabel,
        } = this.props;

        const { highlight } = this.state;
        const displayValue = getDisplayValue(amount, zeroLabel);

        return (
            <div data-test={ testId }>
                <CSSTransition
                    addEndListener={ this.handleTransitionEnd }
                    classNames="changeHighlight"
                    in={ highlight }
                    timeout={ {} }
                >
                    <div
                        aria-live="polite"
                        className={ classNames(
                            'cart-priceItem',
                            'optimizedCheckout-contentPrimary',
                            className
                        ) }
                    >
                        <span className="cart-priceItem-label">
                            <span data-test="cart-price-label">
                                { label }
                                { '  ' }
                            </span>
                            { currencyCode && <span className="cart-priceItem-currencyCode">
                                { `(${currencyCode}) ` }
                            </span> }
                            { onActionTriggered && actionLabel && <span className="cart-priceItem-link">
                                <a
                                    data-test="cart-price-callback"
                                    href="#"
                                    onClick={ preventDefault(onActionTriggered) }
                                >
                                    { actionLabel }
                                </a>
                            </span> }
                        </span>

                        <span className="cart-priceItem-value">
                            <span data-test="cart-price-value">
                                { isNumberValue(displayValue) ?
                                    <ShopperCurrency amount={ displayValue } /> :
                                    displayValue }
                            </span>

                            { superscript && <sup data-test="cart-price-value-superscript">
                                { superscript }
                            </sup> }
                        </span>

                        { children }
                    </div>
                </CSSTransition>
            </div>
        );
    }

    private handleTransitionEnd: (node: HTMLElement, done: () => void) => void = (node, done) => {
        const { previousAmount } = this.state;

        node.addEventListener('animationend', ({ target }) => {
            if (target === node) {
                this.setState({
                    highlight: false,
                    previousAmount,
                });
                done();
            }
        });
    };
}

export default OrderSummaryPrice;
