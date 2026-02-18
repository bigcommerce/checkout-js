import React, { type FunctionComponent, useRef, useState } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CollapseCSSTransition, IconCoupon, IconDownArrow, IconUpArrow } from '@bigcommerce/checkout/ui';

import { ShopperCurrency } from '../../currency';
import { type DiscountItem, useMultiCoupon } from '../useMultiCoupon';

const DiscountItems: FunctionComponent<{ coupons: DiscountItem[] }> = ({ coupons }) => (
    <>
        {coupons.map((coupon) => (
            <div data-test={coupon.testId} key={coupon.name}>
                <div
                    aria-live="polite"
                    className="cart-priceItem optimizedCheckout-contentPrimary"
                >
                    <span className="cart-priceItem-label"><IconCoupon />{coupon.name}</span>
                    <span className="cart-priceItem-value" data-test="cart-price-value">
                        -<ShopperCurrency amount={coupon.amount} />
                    </span>
                </div>
            </div>
        ))}
    </>
);

const DiscountsCollapsible: FunctionComponent<{ discounts: number; discountItems: DiscountItem[] }> = ({ discounts, discountItems }) => {
    const [isCouponDiscountsVisible, setIsCouponDiscountsVisible] = useState(true);
    const discountsRef = useRef<HTMLDivElement>(null);

    return (
        <div>
            <div
                aria-controls="applied-coupon-discounts-collapsable"
                aria-expanded={isCouponDiscountsVisible}
                aria-live="polite"
                className="coupon-discount-toggle cart-priceItem optimizedCheckout-contentPrimary"
                onClick={() => setIsCouponDiscountsVisible(!isCouponDiscountsVisible)}
            >
                <span className="cart-priceItem-label">
                    <div className="toggle-button">
                        <TranslatedString id="redeemable.discounts_text" />
                        {isCouponDiscountsVisible ? <IconDownArrow /> : <IconUpArrow />}
                    </div>
                </span>
                <span className="cart-priceItem-value">
                    -<ShopperCurrency amount={discounts} />
                </span>
            </div>
            <CollapseCSSTransition isVisible={isCouponDiscountsVisible} nodeRef={discountsRef}>
                <div
                    className="applied-discounts-list"
                    id="applied-coupon-discounts-collapsable"
                    ref={discountsRef}
                >
                    <DiscountItems coupons={discountItems} />
                </div>
            </CollapseCSSTransition>
        </div>
    );
};

export const Discounts: FunctionComponent = () => {
    const {
        uiDetails: {
            subtotal,
            discounts,
            discountItems,
        },
    } = useMultiCoupon();

    return (
        <div data-test="cart-subtotal">
            <div aria-live="polite" className="cart-priceItem optimizedCheckout-contentPrimary">
                <span className="cart-priceItem-label">
                    <TranslatedString id="cart.subtotal_text" />
                </span>
                <span className="cart-priceItem-value" data-test="cart-price-value">
                    <ShopperCurrency amount={subtotal} />
                </span>
            </div>
            {(discounts > 0 || discountItems.length > 0) && (
                <DiscountsCollapsible discountItems={discountItems} discounts={discounts} />
            )}
        </div>
    );
};
