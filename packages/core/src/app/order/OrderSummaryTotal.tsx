import React, { type FunctionComponent } from 'react';

import { TranslatedString, withCurrency, type WithCurrencyProps } from '@bigcommerce/checkout/locale';

import OrderSummaryPrice from './OrderSummaryPrice';

export interface OrderSummaryTotalProps {
    orderAmount: number;
    shopperCurrencyCode: string;
    storeCurrencyCode: string;
}

const OrderSummaryTotal: FunctionComponent<OrderSummaryTotalProps & WithCurrencyProps> = ({
    shopperCurrencyCode,
    storeCurrencyCode,
    orderAmount,
    currency,
}) => {
    const hasDifferentCurrency = shopperCurrencyCode !== storeCurrencyCode;
    const label = (
        <>
            {hasDifferentCurrency ? (
                <TranslatedString id="cart.estimated_total_text" />
            ) : (
                <TranslatedString id="cart.total_text" />
            )}
            {` (${shopperCurrencyCode})`}
        </>
    );

    return (
        <>
            <OrderSummaryPrice
                amount={orderAmount}
                className="cart-priceItem--total"
                isOrderTotal
                label={label}
                superscript={hasDifferentCurrency ? '*' : undefined}
                testId="cart-total"
            />
            {hasDifferentCurrency && currency && (
                <p className="cart-priceItem--totalNote" data-test="cart-price-item-total-note">
                    <TranslatedString
                        data={{
                            total: currency.toStoreCurrency(orderAmount),
                            code: storeCurrencyCode,
                        }}
                        id="cart.billed_amount_text"
                    />
                </p>
            )}
        </>
    );
};

export default withCurrency(OrderSummaryTotal);
