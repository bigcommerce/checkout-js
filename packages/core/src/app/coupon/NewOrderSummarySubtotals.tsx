import type { Fee, OrderFee, Tax } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { isOrderFee, OrderSummaryDiscount, OrderSummaryPrice }  from '../order';

import { AppliedGiftCertificates, CouponForm, Discounts } from './components';
import { useMultiCoupon } from './useMultiCoupon';

const ANIMATION_DURATION = 300;

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Animation handlers - height + opacity only, no vertical slide
    const handleEnter = () => {
        const node = couponFormRef.current;
        if (!node || prefersReducedMotion()) return;
        node.style.height = '0px';
        node.style.opacity = '0';
    };

    const handleEntering = () => {
        const node = couponFormRef.current;
        if (!node || prefersReducedMotion()) return;
        void node.offsetHeight;
        node.style.height = `${node.scrollHeight}px`;
        node.style.opacity = '1';
    };

    const handleEntered = () => {
        const node = couponFormRef.current;
        if (!node) return;
        node.style.height = 'auto';
        node.style.opacity = '';
    };

    const handleExit = () => {
        const node = couponFormRef.current;
        if (!node || prefersReducedMotion()) return;
        node.style.height = `${node.offsetHeight}px`;
        node.style.opacity = '1';
    };

    const handleExiting = () => {
        const node = couponFormRef.current;
        if (!node || prefersReducedMotion()) return;
        void node.offsetHeight;
        node.style.height = '0px';
        node.style.opacity = '0';
    };

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
                        onEnter={handleEnter}
                        onEntered={handleEntered}
                        onEntering={handleEntering}
                        onExit={handleExit}
                        onExiting={handleExiting}
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
