import {
    ExtensionRegion,
    type LineItemMap,
    type ShopperCurrency,
    type StoreCurrency,
} from '@bigcommerce/checkout-sdk/essential';
import React, { type FunctionComponent, type ReactNode } from 'react';

import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { useCheckout, useLocale } from '@bigcommerce/checkout/contexts';
import { TranslatedHtml, TranslatedString } from '@bigcommerce/checkout/locale';

import { OrderSummarySubtotals, type OrderSummarySubtotalsProps } from '../coupon';

import OrderSummaryHeader from './OrderSummaryHeader';
import OrderSummaryItems from './OrderSummaryItems';
import OrderSummaryPrice from './OrderSummaryPrice';
import OrderSummarySection from './OrderSummarySection';
import OrderSummaryTotal from './OrderSummaryTotal';

export interface OrderSummaryProps {
    lineItems: LineItemMap;
    total: number;
    headerLink: ReactNode;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrency;
    showHeader?: boolean;
}

const OrderSummary: FunctionComponent<OrderSummaryProps & OrderSummarySubtotalsProps> = ({
    headerLink,
    isTaxIncluded,
    lineItems,
    shopperCurrency,
    storeCurrency,
    taxes,
    total,
    showHeader = true,
    ...orderSummarySubtotalsProps
}) => {
    const displayInclusiveTax = isTaxIncluded && taxes && taxes.length > 0;

    const { currency } = useLocale();

    const {
        selectedState: { checkout, order },
    } = useCheckout(({ data }) => ({
        checkout: data.getCheckout(),
        order: data.getOrder(),
    }));

    const isOrderConfirmation = !checkout && !!order;
    const totalDiscount = checkout ? checkout.totalDiscount : order?.totalDiscount;

    if (!currency) {
        return null;
    }

    const isTotalDiscountVisible = Boolean(totalDiscount && totalDiscount > 0);

    return (
        <article className="cart optimizedCheckout-orderSummary" data-test="cart">
            {showHeader && <OrderSummaryHeader>{headerLink}</OrderSummaryHeader>}

            <OrderSummarySection>
                <OrderSummaryItems displayLineItemsCount items={lineItems} />
            </OrderSummarySection>

            <Extension region={ExtensionRegion.SummaryLastItemAfter} />

            <OrderSummarySubtotals
                fees={orderSummarySubtotalsProps.fees}
                giftWrappingAmount={orderSummarySubtotalsProps.giftWrappingAmount}
                handlingAmount={orderSummarySubtotalsProps.handlingAmount}
                isOrderConfirmation={isOrderConfirmation}
                isTaxIncluded={isTaxIncluded}
                storeCreditAmount={orderSummarySubtotalsProps.storeCreditAmount}
                taxes={taxes}
            />

            <OrderSummarySection>
                <OrderSummaryTotal
                    orderAmount={total}
                    shopperCurrencyCode={shopperCurrency.code}
                    storeCurrencyCode={storeCurrency.code}
                />
                {isTotalDiscountVisible && totalDiscount && (
                    <div className="total-savings optimizedCheckout-contentSecondary">
                        <TranslatedHtml
                            data={{ totalDiscount: currency.toCustomerCurrency(totalDiscount) }}
                            id="redeemable.total_savings_text"
                        />
                    </div>
                )}
            </OrderSummarySection>

            {displayInclusiveTax && (
                <OrderSummarySection>
                    <h5
                        className="cart-taxItem cart-taxItem--subtotal optimizedCheckout-contentPrimary body-regular"
                        data-test="tax-text"
                    >
                        <TranslatedString id="tax.inclusive_label" />
                    </h5>
                    {(taxes || []).map((tax, index) => (
                        <OrderSummaryPrice
                            amount={tax.amount}
                            key={index}
                            label={tax.name}
                            testId="cart-taxes"
                        />
                    ))}
                </OrderSummarySection>
            )}
        </article>
    );
};

export default OrderSummary;
