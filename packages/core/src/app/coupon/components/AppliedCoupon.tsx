import { type Coupon } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

export interface AppliedCouponProps {
    coupon: Coupon;
}

const AppliedCoupon: FunctionComponent<AppliedCouponProps> = ({ coupon }) => (
    <div data-test="cart-coupon">
        <div className="redeemable-column redeemable-info" data-test="redeemable-item--coupon">
            <span className="redeemable-info-header">
                <span className="redeemable-info-header--highlight" data-test="cart-price-label">
                    {coupon.displayName}
                </span>{' '}
                <TranslatedString id="redeemable.coupon_text" />
            </span>
            <span className="redeemable-info-subHeader" data-test="cart-price-code">
                {coupon.code}
            </span>
        </div>
    </div>
);

export default memo(AppliedCoupon);
