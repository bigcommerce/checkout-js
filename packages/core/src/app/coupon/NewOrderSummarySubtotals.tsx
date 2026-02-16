import type { Fee, OrderFee, Tax } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useRef, useState } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CollapseCSSTransition } from '@bigcommerce/checkout/ui';

import { isOrderFee, OrderSummaryDiscount, OrderSummaryPrice }  from '../order';

import { AppliedGiftCertificates, CouponForm, Discounts } from './components';
import { useMultiCoupon } from './useMultiCoupon';

interface MultiCouponProps {
    fees?: Fee[] | OrderFee[];
    giftWrappingAmount?: number;
    handlingAmount?: number;
    isTaxIncluded?: boolean;
    storeCreditAmount?: number;
    taxes?: Tax[];
    isOrderConfirmation?: boolean;
}

const NewOrderSummarySubtotals: FunctionComponent<MultiCouponProps> = ({
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
        isCouponFormCollapsed,
        uiDetails:{
            shipping,
            shippingBeforeDiscount,
        }
    } = useMultiCoupon();

    const [isCouponFormVisible, setIsCouponFormVisible] = useState(!isCouponFormCollapsed);
    const couponFormRef = useRef<HTMLDivElement>(null);

    const toggleCouponForm = () => {
        setIsCouponFormVisible((prevState) => !prevState);
    };

    return (
        <>
            {!isOrderConfirmation && (
                <section className="cart-section optimizedCheckout-orderSummary-cartSection">
                    <a
                        aria-controls="coupon-form-collapsable"
                        aria-expanded={isCouponFormVisible}
                        className="redeemable-label body-cta"
                        data-test="redeemable-label"
                        href="#"
                        onClick={preventDefault(toggleCouponForm)}
                    >
                        <TranslatedString id="redeemable.toggle_action" />
                    </a>

                    <CollapseCSSTransition isVisible={isCouponFormVisible} nodeRef={couponFormRef}>
                        <div className="coupon-form-wrapper" ref={couponFormRef}>
                            <CouponForm />
                        </div>
                    </CollapseCSSTransition>
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

                {!isTaxIncluded && (taxes || []).map((tax, index) => (
                    <OrderSummaryPrice
                        amount={tax.amount}
                        key={index}
                        label={tax.name}
                        testId="cart-taxes"
                    />
                ))}

                <AppliedGiftCertificates giftCertificates={appliedGiftCertificates}/>

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

export default NewOrderSummarySubtotals;
