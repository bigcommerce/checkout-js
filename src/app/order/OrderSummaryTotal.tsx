import React, { Fragment, FunctionComponent } from 'react';

import { withCurrency, TranslatedString, WithCurrencyProps } from '../locale';

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
    const label = <Fragment>
        { hasDifferentCurrency ?
            <TranslatedString id="cart.estimated_total_text" /> :
            <TranslatedString id="cart.total_text" />
        }
        { ` (${shopperCurrencyCode})` }
    </Fragment>;

    return (
        <Fragment>
            <OrderSummaryPrice
                amount={ orderAmount }
                className="cart-priceItem--total"
                label={ label }
                testId="cart-total"
                superscript={ hasDifferentCurrency ? '*' : undefined }
            />
            { hasDifferentCurrency && currency && <p
                className="cart-priceItem--totalNote"
                data-test="cart-price-item-total-note"
            >
                <TranslatedString
                    id="cart.billed_amount_text"
                    data={ {
                        total: currency.toStoreCurrency(orderAmount),
                        code: storeCurrencyCode,
                    } }
                />
            </p> }
        </Fragment>
    );
};

export default withCurrency(OrderSummaryTotal);
