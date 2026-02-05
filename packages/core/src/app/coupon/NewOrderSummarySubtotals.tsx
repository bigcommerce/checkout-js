import type { Fee, OrderFee, Tax } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { ANIMATION_DURATION, createCollapseAnimationHandlers } from '../common/animation';
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

    const collapseHandlers = createCollapseAnimationHandlers(couponFormRef);

    return (
        <>
            {!isOrderConfirmation && (
                <section className="cart-section optimizedCheckout-orderSummary-cartSection">
                    <a
                        aria-controls="coupon-form-collapsable"
                        aria-expanded={isCouponFormVisible}
                        className="redeemable-label"
                        data-test="redeemable-label"
                        href="#"
                        onClick={preventDefault(toggleCouponForm)}
                    >
                        <TranslatedString id="redeemable.toggle_action" />
                    </a>

                    <CSSTransition
                        in={isCouponFormVisible}
                        nodeRef={couponFormRef}
                        onEnter={collapseHandlers.handleEnter}
                        onEntered={collapseHandlers.handleEntered}
                        onEntering={collapseHandlers.handleEntering}
                        onExit={collapseHandlers.handleExit}
                        onExiting={collapseHandlers.handleExiting}
                        timeout={ANIMATION_DURATION}
                        unmountOnExit
                    >
                        <div className="coupon-form-wrapper" ref={couponFormRef}>
                            <CouponForm />
                        </div>
                    </CSSTransition>
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
