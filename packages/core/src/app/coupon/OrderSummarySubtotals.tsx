import type { Fee, OrderFee, Tax } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { useCapabilities } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { isOrderFee, OrderSummaryDiscount, OrderSummaryPrice } from '../order';

import { AppliedGiftCertificates, CollapsibleCouponForm, Discounts } from './components';
import { useMultiCoupon } from './useMultiCoupon';

export interface OrderSummarySubtotalsProps {
    fees?: Fee[] | OrderFee[];
    giftWrappingAmount?: number;
    handlingAmount?: number;
    isTaxIncluded?: boolean;
    storeCreditAmount?: number;
    taxes?: Tax[];
    isOrderConfirmation?: boolean;
}

const OrderSummarySubtotals: FunctionComponent<OrderSummarySubtotalsProps> = ({
    fees,
    giftWrappingAmount,
    handlingAmount,
    isTaxIncluded,
    storeCreditAmount,
    taxes,
    isOrderConfirmation = false,
}) => {
    const {
        appliedGiftCertificates,
        uiDetails: { shipping, shippingBeforeDiscount },
    } = useMultiCoupon();

    const {
        userJourney: { disableCoupon, disableGiftCertificate },
    } = useCapabilities();

    return (
        <>
            {!isOrderConfirmation && !(disableCoupon && disableGiftCertificate) && (
                <section className="cart-section optimizedCheckout-orderSummary-cartSection">
                    <CollapsibleCouponForm />
                </section>
            )}
            <section className="subtotals-with-multi-coupon cart-section optimizedCheckout-orderSummary-cartSection">
                <Discounts />

                <OrderSummaryPrice
                    amount={shipping}
                    amountBeforeDiscount={shippingBeforeDiscount}
                    label={<TranslatedString id="cart.shipping_text" />}
                    testId="cart-shipping"
                    zeroLabel={<TranslatedString id="cart.free_text" />}
                />

                {!!giftWrappingAmount && (
                    <OrderSummaryPrice
                        amount={giftWrappingAmount}
                        label={<TranslatedString id="cart.gift_wrapping_text" />}
                        testId="cart-gift-wrapping"
                    />
                )}

                {!!handlingAmount && (
                    <OrderSummaryPrice
                        amount={handlingAmount}
                        label={<TranslatedString id="cart.handling_text" />}
                        testId="cart-handling"
                    />
                )}

                {fees?.map((fee, index) => (
                    <OrderSummaryPrice
                        amount={fee.cost}
                        key={index}
                        label={isOrderFee(fee) ? fee.customerDisplayName : fee.displayName}
                        testId="cart-fees"
                    />
                ))}

                {!isTaxIncluded &&
                    (taxes || []).map((tax, index) => (
                        <OrderSummaryPrice
                            amount={tax.amount}
                            key={index}
                            label={tax.name}
                            testId="cart-taxes"
                        />
                    ))}

                <AppliedGiftCertificates giftCertificates={appliedGiftCertificates} />

                {!!storeCreditAmount && (
                    <OrderSummaryDiscount
                        amount={storeCreditAmount}
                        label={<TranslatedString id="cart.store_credit_text" />}
                        testId="cart-store-credit"
                    />
                )}
            </section>
        </>
    );
};

export default OrderSummarySubtotals;
