import { LineItemMap, ShopperCurrency, StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, { useMemo, FunctionComponent, ReactNode } from 'react';

import withRecurly from '../recurly/withRecurly';

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
    hasSubscription?: boolean;
}

const OrderSummary: FunctionComponent<OrderSummaryProps & OrderSummarySubtotalsProps> = ({
    storeCurrency,
    shopperCurrency,
    headerLink,
    additionalLineItems,
    lineItems,
    total,
    hasSubscription,
    ...orderSummarySubtotalsProps
}) => {
    const nonBundledLineItems = useMemo(() => (
        removeBundledItems(lineItems)
    ), [lineItems]);

    return <article className="cart optimizedCheckout-orderSummary" data-test="cart">
        <OrderSummaryHeader>
            { headerLink }
        </OrderSummaryHeader>

        <OrderSummarySection>
            <OrderSummaryItems items={ nonBundledLineItems } />
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
        { hasSubscription && <section className="cart-section optimizedCheckout-orderSummary-cartSection">
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
    </article>;
};

export default withRecurly(props => props)(OrderSummary);
