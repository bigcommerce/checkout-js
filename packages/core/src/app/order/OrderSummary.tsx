import {
    ExtensionRegion,
    LineItemMap,
    ShopperCurrency,
    StoreCurrency,
} from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { FunctionComponent, ReactNode, useMemo } from 'react';

import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { useStyleContext } from '@bigcommerce/checkout/payment-integration-api';

import OrderSummaryHeader from './OrderSummaryHeader';
import OrderSummaryItems from './OrderSummaryItems';
import OrderSummaryPrice from './OrderSummaryPrice';
import OrderSummarySection from './OrderSummarySection';
import OrderSummarySubtotals, { OrderSummarySubtotalsProps } from './OrderSummarySubtotals';
import OrderSummaryTotal from './OrderSummaryTotal';
import removeBundledItems from './removeBundledItems';

export interface OrderSummaryProps {
    lineItems: LineItemMap;
    total: number;
    headerLink: ReactNode;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrency;
    additionalLineItems?: ReactNode;
}

const OrderSummary: FunctionComponent<OrderSummaryProps & OrderSummarySubtotalsProps> = ({
    isTaxIncluded,
    taxes,
    storeCurrency,
    shopperCurrency,
    headerLink,
    additionalLineItems,
    lineItems,
    total,
    ...orderSummarySubtotalsProps
}) => {
    const nonBundledLineItems = useMemo(() => removeBundledItems(lineItems), [lineItems]);
    const displayInclusiveTax = isTaxIncluded && taxes && taxes.length > 0;

    const { newFontStyle } = useStyleContext();

    return (
        <article className="cart optimizedCheckout-orderSummary" data-test="cart">
            <OrderSummaryHeader>{headerLink}</OrderSummaryHeader>

            <OrderSummarySection>
                <OrderSummaryItems displayLineItemsCount items={nonBundledLineItems} newFontStyle={newFontStyle} />
            </OrderSummarySection>

            <Extension region={ExtensionRegion.SummaryLastItemAfter} />

            <OrderSummarySection>
                <OrderSummarySubtotals isTaxIncluded={isTaxIncluded} taxes={taxes} {...orderSummarySubtotalsProps} />
                {additionalLineItems}
            </OrderSummarySection>

            <OrderSummarySection>
                <OrderSummaryTotal
                    orderAmount={total}
                    shopperCurrencyCode={shopperCurrency.code}
                    storeCurrencyCode={storeCurrency.code}
                />
            </OrderSummarySection>

            {displayInclusiveTax && <OrderSummarySection>
                <h5
                    className={classNames('cart-taxItem cart-taxItem--subtotal optimizedCheckout-contentPrimary',
                        { 'body-regular': newFontStyle })}
                    data-test="tax-text"
                >
                    <TranslatedString
                        id="tax.inclusive_label"
                    />
                </h5>
                {(taxes || []).map((tax, index) => (
                    <OrderSummaryPrice
                        amount={tax.amount}
                        key={index}
                        label={tax.name}
                        testId="cart-taxes"
                    />
                ))}
            </OrderSummarySection>}
        </article>
    );
};

export default OrderSummary;
