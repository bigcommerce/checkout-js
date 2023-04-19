import { Coupon } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

export interface AppliedCouponProps {
    coupon: Coupon;
}

const AppliedCoupon: FunctionComponent<AppliedCouponProps> = ({ coupon }) => (
    <div className="redeemable-column redeemable-info" data-test="redeemable-item--coupon">
        <span className="redeemable-info-header">
            <span className="redeemable-info-header--highlight" data-test="coupon-amount">
                {coupon.displayName}
            </span>{' '}
            <TranslatedString id="redeemable.coupon_text" />
        </span>

        <span className="redeemable-info-subHeader" data-test="coupon-code">
            {coupon.code}
        </span>
    </div>
);

export default memo(AppliedCoupon);
