import React, { type FunctionComponent, useState } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconCoupon, IconDownArrow, IconUpArrow } from '@bigcommerce/checkout/ui';

import { ShopperCurrency } from '../../currency';
import { type DiscountItem, useMultiCoupon } from '../useMultiCoupon';

const DiscountItem: FunctionComponent<{ coupons: DiscountItem[] }> = ({ coupons }) => {
    return coupons.map((coupon) => (
        <div
            aria-live="polite"
            className="cart-priceItem optimizedCheckout-contentPrimary"
            key={coupon.name}
        >
            <span className="cart-priceItem-label"><IconCoupon />{coupon.name}</span>
            <span className="cart-priceItem-value">
                -<ShopperCurrency amount={coupon.amount} />
            </span>
        </div>
    ));
}

export const Discounts: FunctionComponent = () => {
    const [isCouponDiscountsVisible, setIsCouponDiscountsVisible] = useState(true);

    const {
        uiDetails: {
            subtotal,
            discounts,
            discountItems,
        },
    } = useMultiCoupon();

    return (
        <>
            <div aria-live="polite" className="cart-priceItem optimizedCheckout-contentPrimary">
                <span className="cart-priceItem-label">
                    <TranslatedString id="cart.subtotal_text" />
                </span>
                <span className="cart-priceItem-value">
                    <ShopperCurrency amount={subtotal} />
                </span>
            </div>
            {discounts > 0 && (
                <>
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
                    {isCouponDiscountsVisible && (
                        <div className="applied-discounts-list" id="applied-coupon-discounts-collapsable">
                            <DiscountItem coupons={discountItems} />
                        </div>
                    )}
                </>
            )}
        </>
    );
};
