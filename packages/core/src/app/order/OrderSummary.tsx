import {
    ExtensionRegion,
    type LineItemMap,
    type ShopperCurrency,
    type StoreCurrency,
} from '@bigcommerce/checkout-sdk/essential';
import classNames from 'classnames';
import React, { type FunctionComponent, type ReactNode, useMemo } from 'react';

import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { useCheckout, useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedHtml, TranslatedString } from '@bigcommerce/checkout/locale';

import { isExperimentEnabled } from '../common/utility';
import { NewOrderSummarySubtotals } from '../coupon';

import OrderSummaryHeader from './OrderSummaryHeader';
import OrderSummaryItems from './OrderSummaryItems';
import OrderSummaryPrice from './OrderSummaryPrice';
import OrderSummarySection from './OrderSummarySection';
import OrderSummarySubtotals, { type OrderSummarySubtotalsProps } from './OrderSummarySubtotals';
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
    additionalLineItems,
    headerLink,
    isTaxIncluded,
    lineItems,
    shopperCurrency,
    storeCurrency,
    taxes,
    total,
    ...orderSummarySubtotalsProps
}) => {
    const { checkoutState } = useCheckout();
    const { checkoutSettings } = checkoutState.data.getConfig() ?? {};

    // TODO: When removing the experiment, rename `NewOrderSummarySubtotals` to `OrderSummarySubtotals`.
    const isMultiCouponEnabled = isExperimentEnabled(checkoutSettings, 'PROJECT-7321-5991.multi-coupon-cart-checkout', false);

    const nonBundledLineItems = useMemo(() => removeBundledItems(lineItems), [lineItems]);
    const displayInclusiveTax = isTaxIncluded && taxes && taxes.length > 0;

    const { themeV2 } = useThemeContext();

    return (
        <article className="cart optimizedCheckout-orderSummary" data-test="cart">
            <OrderSummaryHeader>{headerLink}</OrderSummaryHeader>

            <OrderSummarySection>
                <OrderSummaryItems displayLineItemsCount items={nonBundledLineItems} themeV2={themeV2} />
            </OrderSummarySection>

            <Extension region={ExtensionRegion.SummaryLastItemAfter} />

            {isMultiCouponEnabled
                ? <NewOrderSummarySubtotals
                        fees={orderSummarySubtotalsProps.fees}
                        giftWrappingAmount={orderSummarySubtotalsProps.giftWrappingAmount}
                        handlingAmount={orderSummarySubtotalsProps.handlingAmount}
                        isTaxIncluded={isTaxIncluded}
                        storeCreditAmount={orderSummarySubtotalsProps.storeCreditAmount}
                        taxes={taxes}
                    />
                : <OrderSummarySection>
                    <OrderSummarySubtotals isTaxIncluded={isTaxIncluded} taxes={taxes} {...orderSummarySubtotalsProps} />
                    {additionalLineItems}
                </OrderSummarySection>
            }

            <OrderSummarySection>
                <OrderSummaryTotal
                    orderAmount={total}
                    shopperCurrencyCode={shopperCurrency.code}
                    storeCurrencyCode={storeCurrency.code}
                />
                {isMultiCouponEnabled &&
                    <div className="total-savings">
                        <TranslatedHtml
                            data={{ totalSaving: '$75.64' }}
                            id="redeemable.total_savings_text"
                        />
                    </div>
                }
            </OrderSummarySection>

            {displayInclusiveTax && <OrderSummarySection>
                <h5
                    className={classNames('cart-taxItem cart-taxItem--subtotal optimizedCheckout-contentPrimary',
                        { 'body-regular': themeV2 })}
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
