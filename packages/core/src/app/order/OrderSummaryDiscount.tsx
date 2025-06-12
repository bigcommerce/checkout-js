import classNames from 'classnames';
import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { useStyleContext } from '@bigcommerce/checkout/payment-integration-api';

import { ShopperCurrency } from '../currency';

import OrderSummaryPrice, { OrderSummaryPriceProps } from './OrderSummaryPrice';

export interface OrderSummaryDiscountProps extends OrderSummaryPriceProps {
    remaining?: number;
    code?: string;
    onRemoved?(code: string): void;
}

const OrderSummaryDiscount: FunctionComponent<OrderSummaryDiscountProps> = ({
    code,
    remaining,
    amount,
    onRemoved,
    ...rest
}) => {
    const { newFontStyle } = useStyleContext();

    return (
        <OrderSummaryPrice
            {...rest}
            {...(onRemoved && {
                onActionTriggered: () => code && onRemoved(code),
                actionLabel: <TranslatedString id="redeemable.remove_action" />,
            })}
            amount={-1 * (amount || 0)}
        >
            {!!remaining && remaining > 0 && (
                <span
                    className="cart-priceItem-postFix optimizedCheckout-contentSecondary"
                    data-test="cart-price-remaining"
                >
                    <TranslatedString id="cart.remaining_text" />
                    {': '}
                    <ShopperCurrency amount={remaining} />
                </span>
            )}

            {code && (
                <span
                    className={classNames('cart-priceItem-postFix optimizedCheckout-contentSecondary',
                        { 'sub-text-medium': newFontStyle })}
                    data-test="cart-price-code"
                >
                    {code}
                </span>
            )}
        </OrderSummaryPrice>
    );
}

export default memo(OrderSummaryDiscount);
