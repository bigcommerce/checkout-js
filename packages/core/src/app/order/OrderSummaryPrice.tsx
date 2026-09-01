import classNames from 'classnames';
import React, { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import { useCheckout, useThemeContext } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';

import { ShopperCurrency } from '../currency';

import { PriceTicker } from './PriceTicker';
import { PriceTickerPhase, usePriceChangeTicker } from './usePriceChangeTicker';

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
    const [highlight, setHighlight] = useState<boolean>(false);
    const [previousAmount, setPreviousAmount] = useState<OrderSummaryPriceProps['amount']>(amount);
    const { selectedState: isActionDisabled } = useCheckout(({ statuses }) =>
        statuses.isSubmittingOrder(),
    );
    const { enhancedThemeV1 } = useThemeContext();

    const { phase, displayAmount } = usePriceChangeTicker(amount, enhancedThemeV1);
    const showDots = phase === PriceTickerPhase.Dots;
    const displayValue = getDisplayValue(displayAmount, zeroLabel);

    useEffect(() => {
        if (!enhancedThemeV1) {
            setHighlight(amount !== previousAmount);
            setPreviousAmount(amount);
        }
    }, [amount]);

    const handleTransitionEnd: (node: HTMLElement, done: () => void) => void = useCallback(
        (node, done) => {
            node.addEventListener('animationend', ({ target }) => {
                if (target === node) {
                    setHighlight(false);
                    done();
                }
            });
        },
        [setHighlight],
    );

    const handleActionTrigger = () => {
        if (isActionDisabled || !onActionTriggered) {
            return;
        }

        onActionTriggered();
    };

    const priceRow = (
        <div
            aria-busy={phase !== PriceTickerPhase.Idle || undefined}
            aria-live="polite"
            className={classNames('cart-priceItem', 'optimizedCheckout-contentPrimary', className)}
        >
            <span
                className={classNames('cart-priceItem-label', {
                    'body-regular optimizedCheckout-contentPrimary': !isOrderTotal,
                    'sub-header optimizedCheckout-headingSecondary': isOrderTotal,
                })}
            >
                <span data-test="cart-price-label">
                    {label}
                    {'  '}
                </span>
                {currencyCode && (
                    <span className="cart-priceItem-currencyCode">{`(${currencyCode}) `}</span>
                )}
                {onActionTriggered && actionLabel && (
                    <span className="cart-priceItem-link">
                        <a
                            className={classNames({
                                'link--disabled': isActionDisabled,
                                'body-cta': !isOrderTotal,
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

            <span
                className={classNames('cart-priceItem-value', {
                    'body-medium optimizedCheckout-contentPrimary': !isOrderTotal,
                    'header optimizedCheckout-headingPrimary': isOrderTotal,
                })}
            >
                {!showDots &&
                    isNumberValue(amountBeforeDiscount) &&
                    amountBeforeDiscount !== displayAmount && (
                        <span className="cart-priceItem-before-value">
                            <ShopperCurrency amount={amountBeforeDiscount} />
                        </span>
                    )}

                <span data-test="cart-price-value">
                    <PriceTicker phase={phase}>
                        {isNumberValue(displayValue) ? (
                            <ShopperCurrency amount={displayValue} />
                        ) : (
                            displayValue
                        )}
                    </PriceTicker>
                </span>

                {superscript && !showDots && (
                    <sup data-test="cart-price-value-superscript">{superscript}</sup>
                )}
            </span>

            {children}
        </div>
    );

    if (enhancedThemeV1) {
        return <div data-test={testId}>{priceRow}</div>;
    }

    return (
        <div data-test={testId}>
            <CSSTransition
                addEndListener={handleTransitionEnd}
                classNames="changeHighlight"
                in={highlight}
                timeout={{}}
            >
                {priceRow}
            </CSSTransition>
        </div>
    );
};

export default OrderSummaryPrice;
