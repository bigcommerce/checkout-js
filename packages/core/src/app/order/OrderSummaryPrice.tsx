import classNames from 'classnames';
import React, {Component, FunctionComponent, ReactNode, useEffect, useState} from 'react';
import { CSSTransition } from 'react-transition-group';

import { preventDefault } from '../common/dom';
import { ShopperCurrency } from '../currency';
import {LineItemMap} from "@bigcommerce/checkout-sdk";

export interface OrderSummaryPriceProps {
    label: ReactNode;
    amount?: number | null;
    zeroLabel?: ReactNode;
    className?: string;
    testId?: string;
    currencyCode?: string;
    superscript?: string;
    actionLabel?: ReactNode;
    shippingAmount?: number | null;
    lineItems?: LineItemMap;
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
const ConfidenceBlock: FunctionComponent<any> = props => {
    const { lineItems, shippingAmount } = props;
    const [isFreeShipping, setIsFreeShipping] = useState(false);
    const [hasSubscription, setHasSubscription] = useState(false);
    useEffect(() => {
        const test = lineItems?.physicalItems && lineItems.physicalItems.find((v: any) => v.options.find((o: any) => o.value === 'send every 30 days'));
        if (test !== hasSubscription) {
            setHasSubscription(test);
        }
    }, [lineItems]);

    useEffect(() => {
        setIsFreeShipping(shippingAmount === 0);
    }, [shippingAmount]);
    return (
        <>
            { hasSubscription && <section className="payments cart-subscription cart-section optimizedCheckout-orderSummary-cartSection">
                <div data-test="cart-total">
                    <div aria-live="polite" className="cart-priceItem optimizedCheckout-contentPrimary cart-priceItem--total">
                    <span className="cart-priceItem-label">
                        <span data-test="cart-price-label">
                            Your order contains a subscription. This reoccurs every 30 days. You can cancel any time.
                        </span>
                    </span>
                    </div>
                </div>
            </section> }
                <div className="payments">
                    {isFreeShipping && !hasSubscription && <div className="free-shipping">
                        Your order qualifies for free shipping!
                    </div>}
                    {hasSubscription && (
                        <><h2>Enjoy your MitoQ subscription with:</h2>
                            <ul className="benefit-list">
                                <li>Free shipping on all orders</li>
                                <li>Skip or pause subscription anytime</li>
                                <li>Cancel anytime</li>
                                <li>Delivered monthly, direct to you</li>
                            </ul></>)
                    }
                    <div className={`payments-method ${!hasSubscription ? 'full-method' : ''}`}>
                        <div className="payment-icon visacard-icon"></div>
                        <div className="payment-icon diners-icon"></div>
                        <div className="payment-icon mastercard-icon"></div>
                        <div className="payment-icon amex-icon"></div>
                        <div className="payment-icon discover-icon"></div>
                        <div className="payment-icon jcb-icon"></div>
                        {   !hasSubscription &&
                            (<><div className="payment-icon paypal-icon"></div><div className="payment-icon gpay-icon"></div></>)
                        }

                    </div>
                </div>
            </>
    );
};

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
            shippingAmount,
            lineItems,
        } = this.props;

        const { highlight } = this.state;
        const displayValue = getDisplayValue(amount, zeroLabel);

        return (
            <div data-test={testId}>
                <CSSTransition
                    addEndListener={this.handleTransitionEnd}
                    classNames="changeHighlight"
                    in={highlight}
                    timeout={{}}
                >
                    <div
                        aria-live="polite"
                        className={classNames(
                            'cart-priceItem',
                            'optimizedCheckout-contentPrimary',
                            className,
                        )}
                    >
                        <span className="cart-priceItem-label">
                            <span data-test="cart-price-label">
                                {label}
                                {'  '}
                            </span>
                            {currencyCode && (
                                <span className="cart-priceItem-currencyCode">
                                    {`(${currencyCode}) `}
                                </span>
                            )}
                            {onActionTriggered && actionLabel && (
                                <span className="cart-priceItem-link">
                                    <a
                                        data-test="cart-price-callback"
                                        href="#"
                                        onClick={preventDefault(onActionTriggered)}
                                    >
                                        {actionLabel}
                                    </a>
                                </span>
                            )}
                        </span>

                        <span className="cart-priceItem-value">
                            <span data-test="cart-price-value">
                                {isNumberValue(displayValue) ? (
                                    <ShopperCurrency amount={displayValue} />
                                ) : (
                                    displayValue
                                )}
                            </span>

                            {superscript && (
                                <sup data-test="cart-price-value-superscript">{superscript}</sup>
                            )}
                        </span>

                        {children}
                    </div>
                </CSSTransition>
                {
                    testId === 'cart-total' &&
                    <ConfidenceBlock shippingAmount={shippingAmount} amount={amount} currencyCode={currencyCode} lineItems={lineItems} />
                }
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
