import classNames from 'classnames';
import React, { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';

import { ShopperCurrency } from '../currency';

export interface OrderSummaryPriceProps {
    children?: ReactNode;
    label: ReactNode;
    amount?: number | null;
    amountBeforeDiscount?: number;
    zeroLabel?: ReactNode;
    className?: string;
    testId?: string;
    currencyCode?: string;
    superscript?: string;
    actionLabel?: ReactNode;
    onActionTriggered?(): void;
    isOrderTotal?: boolean;
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

const OrderSummaryPrice: FC<OrderSummaryPriceProps> = ({
    amount,
    amountBeforeDiscount,
    actionLabel,
    onActionTriggered,
    children,
    className,
    currencyCode,
    label,
    superscript,
    testId,
    zeroLabel,
    isOrderTotal = false,
}) => {
    const [ highlight, setHighlight ] = useState<boolean>(false);
    const [ previousAmount, setPreviousAmount ] = useState<OrderSummaryPriceProps['amount']>(amount);
    const {
        checkoutState: {
            statuses: { isSubmittingOrder }
        }
    } = useCheckout();

    const displayValue = getDisplayValue(amount, zeroLabel);
    const isActionDisabled = isSubmittingOrder();

    useEffect(() => {
        setHighlight(amount !== previousAmount);
        setPreviousAmount(amount);
    }, [ amount ]);

    const handleTransitionEnd: (node: HTMLElement, done: () => void) => void = useCallback((node, done) => {
        node.addEventListener('animationend', ({ target }) => {
            if (target === node) {
                setHighlight(false);
                done();
            }
        });
    }, [ setHighlight ]);

    const handleActionTrigger = () => {
        if (isActionDisabled || !onActionTriggered) {
            return;
        }

        onActionTriggered();
    }

    return (
        <div data-test={testId}>
            <CSSTransition
                addEndListener={handleTransitionEnd}
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
                    <span className={classNames('cart-priceItem-label',
                        {
                            'body-regular': !isOrderTotal,
                            'sub-header': isOrderTotal
                        })}
                    >
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
                                    className={classNames({
                                        'link--disabled': isActionDisabled,
                                        'body-cta': !isOrderTotal
                                    })}
                                    data-test="cart-price-callback"
                                    href="#"
                                    onClick={preventDefault(handleActionTrigger)}
                                >
                                    {actionLabel}
                                </a>
                            </span>
                        )}
                    </span>

                    <span className={classNames('cart-priceItem-value',
                        {
                            'body-medium': !isOrderTotal,
                            'header': isOrderTotal
                        })}
                    >
                        {isNumberValue(amountBeforeDiscount) && amountBeforeDiscount !== amount && (
                            <span className="cart-priceItem-before-value">
                                <ShopperCurrency amount={amountBeforeDiscount} />
                            </span>
                        )}

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
        </div>
    );
};

export default OrderSummaryPrice;
