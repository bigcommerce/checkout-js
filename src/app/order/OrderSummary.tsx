import {
    LineItemMap,
    ShopperCurrency,
    StoreCurrency,
} from '@bigcommerce/checkout-sdk';
import React, { Fragment, FunctionComponent, ReactNode } from 'react';

import removeBundledItems from './removeBundledItems';
import OrderSummaryHeader from './OrderSummaryHeader';
import OrderSummaryItems from './OrderSummaryItems';
import OrderSummarySection from './OrderSummarySection';
import OrderSummarySubtotals, { OrderSummarySubtotalsProps } from './OrderSummarySubtotals';
import OrderSummaryTotal from './OrderSummaryTotal';

export interface OrderSummaryProps {
    lineItems: LineItemMap;
    total: number;
    headerLink: ReactNode;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrency;
    additionalLineItems?: ReactNode;
}

const OrderSummary: FunctionComponent<OrderSummaryProps & OrderSummarySubtotalsProps> = ({
    storeCurrency,
    shopperCurrency,
    headerLink,
    additionalLineItems,
    lineItems,
    total,
    ...orderSummarySubtotalsProps
}) => (<Fragment>
    <article className="cart optimizedCheckout-orderSummary" data-test="cart">
        <OrderSummaryHeader>
            { headerLink }
        </OrderSummaryHeader>
        <OrderSummarySection>
            <OrderSummaryItems items={ removeBundledItems(lineItems) } />
        </OrderSummarySection>
        <OrderSummarySection>
            <OrderSummarySubtotals
                { ...orderSummarySubtotalsProps }
            />
            { additionalLineItems }
        </OrderSummarySection>
        <OrderSummarySection>
            <OrderSummaryTotal
                orderAmount={ total }
                shopperCurrencyCode={ shopperCurrency.code }
                storeCurrencyCode={ storeCurrency.code }
            />
        </OrderSummarySection>
    </article>
</Fragment>);

export default OrderSummary;
