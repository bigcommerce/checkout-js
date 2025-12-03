import React, { type FunctionComponent, useState } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconCoupon, IconDownArrow, IconUpArrow } from '@bigcommerce/checkout/ui';


export const Discounts: FunctionComponent = () => {
    const [isCouponDiscountsVisible, setIsCouponDiscountsVisible] = useState(true);
    const [isShippingDiscountsVisible, setIsShippingDiscountsVisible] = useState(true);

    return (
        <>
            <div aria-live="polite" className="cart-priceItem optimizedCheckout-contentPrimary">
                <span className="cart-priceItem-label">
                    <TranslatedString id="cart.subtotal_text" />
                </span>
                <span className="cart-priceItem-value">$40.00</span>
            </div>
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
                <span className="cart-priceItem-value">-$16.00</span>
            </div>
            {isCouponDiscountsVisible && (
                <div className="applied-discounts-list" id="applied-coupon-discounts-collapsable">
                    <div aria-live="polite" className="cart-priceItem optimizedCheckout-contentPrimary">
                        <span className="cart-priceItem-label">
                            <IconCoupon /> HAPPY NEW YEAR
                        </span>
                        <span className="cart-priceItem-value">-$4.00</span>
                    </div>
                    <div aria-live="polite" className="cart-priceItem optimizedCheckout-contentPrimary">
                        <span className="cart-priceItem-label">
                            <IconCoupon /> Long Long Long Long Long Long Long Long Long Long Long Long Long Automatic promotion
                        </span>
                        <span className="cart-priceItem-value">-$4.00</span>
                    </div>
                    <div aria-live="polite" className="cart-priceItem optimizedCheckout-contentPrimary">
                        <span className="cart-priceItem-label">
                            <IconCoupon /> New customer 10% off Loooooooooooooooooong(EXTRA12345)
                        </span>
                        <span className="cart-priceItem-value">-$4.00</span>
                    </div>
                    <div aria-live="polite" className="cart-priceItem optimizedCheckout-contentPrimary">
                        <span className="cart-priceItem-label">
                            <IconCoupon /> NEW10OFF
                        </span>
                        <span className="cart-priceItem-value">-$4.00</span>
                    </div>
                </div>
            )}
            <div
                aria-controls="applied-shipping-discounts-collapsable"
                aria-expanded={isShippingDiscountsVisible}
                aria-live="polite"
                className="shipping-discount-toggle cart-priceItem optimizedCheckout-contentPrimary"
                onClick={() => setIsShippingDiscountsVisible(!isShippingDiscountsVisible)}
            >
                <span className="cart-priceItem-label">
                    <div className="toggle-button">
                        <TranslatedString id="shipping.shipping_heading" />
                        {isShippingDiscountsVisible ? <IconDownArrow /> : <IconUpArrow />}
                    </div>
                </span>
                <span className="cart-priceItem-value">
                    <span className="shipping-cost-before-discount">$10.00</span> $6.00
                </span>
            </div>
            {isShippingDiscountsVisible && (
                <div className="applied-discounts-list" id="applied-shipping-discounts-collapsable">
                    <div aria-live="polite" className="cart-priceItem optimizedCheckout-contentPrimary">
                        <span className="cart-priceItem-label">
                            <IconCoupon /> Save on shipping (SHIPPINGSAVE)
                        </span>
                        <span className="cart-priceItem-value">-$1.00</span>
                    </div>
                    <div aria-live="polite" className="cart-priceItem optimizedCheckout-contentPrimary">
                        <span className="cart-priceItem-label">
                            <IconCoupon /> Automatic promotion
                        </span>
                        <span className="cart-priceItem-value">-$3.00</span>
                    </div>
                </div>
            )}
        </>
    );
};
