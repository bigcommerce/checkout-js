import type { Fee, OrderFee, Tax } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useRef, useState } from 'react';

import { useCapabilities } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CollapseCSSTransition } from '@bigcommerce/checkout/ui';

import { isOrderFee, OrderSummaryDiscount, OrderSummaryPrice } from '../order';

import { AppliedGiftCertificates, CouponForm, Discounts } from './components';

// Must match SURCHARGE_FEE_NAME in the SDK surcharge handler.
const SURCHARGE_FEE_NAME = 'corporate_card_surcharge';

const isSurchargeFee = (fee: Fee | OrderFee): boolean =>
    'name' in fee && fee.name === SURCHARGE_FEE_NAME;

import { useMultiCoupon } from './useMultiCoupon';
import { getRedeemableLabelId } from './utils';

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
        uiDetails: { shipping, shippingBeforeDiscount },
    } = useMultiCoupon();

    const {
        userJourney: { disableCoupon, disableGiftCertificate },
    } = useCapabilities();

    const [isCouponFormVisible, setIsCouponFormVisible] = useState(!isCouponFormCollapsed);
    const couponFormRef = useRef<HTMLDivElement>(null);

    // Shown as its own labelled row; other fees stay generic.
    // NOTE: the surcharge fee comes from the BE Fees API (Checkout.fees). Until that endpoint
    // is implemented on the BE, no surcharge fee is present, so this row simply won't render.
    const surchargeFee = (fees ?? []).find(isSurchargeFee);
    const otherFees = (fees ?? []).filter((fee) => !isSurchargeFee(fee)) as typeof fees;

    const toggleCouponForm = () => {
        setIsCouponFormVisible((prevState) => !prevState);
    };

    return (
        <>
            {!isOrderConfirmation && !(disableCoupon && disableGiftCertificate) && (
                <section className="cart-section optimizedCheckout-orderSummary-cartSection">
                    <a
                        aria-controls="coupon-form-collapsable"
                        aria-expanded={isCouponFormVisible}
                        className="redeemable-label body-cta"
                        data-test="redeemable-label"
                        href="#"
                        onClick={preventDefault(toggleCouponForm)}
                    >
                        <TranslatedString
                            id={getRedeemableLabelId(disableGiftCertificate, disableCoupon)}
                        />
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

                {/* Surcharge placeholder — shown once applied in-flight. */}
                {!!surchargeFee && (
                    <OrderSummaryPrice
                        amount={surchargeFee.cost}
                        label={<TranslatedString id="cart.surcharge_text" />}
                        testId="cart-surcharge"
                    />
                )}

                {otherFees?.map((fee, index) => (
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

export default NewOrderSummarySubtotals;
