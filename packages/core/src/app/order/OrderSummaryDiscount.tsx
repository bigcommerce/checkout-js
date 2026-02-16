import React, { type FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { ShopperCurrency } from '../currency';

import OrderSummaryPrice, { type OrderSummaryPriceProps } from './OrderSummaryPrice';

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
                    className="cart-priceItem-postFix optimizedCheckout-contentSecondary sub-text-medium"
                    data-test="cart-price-code"
                >
                    {code}
                </span>
            )}
        </OrderSummaryPrice>
    );
}

export default memo(OrderSummaryDiscount);
