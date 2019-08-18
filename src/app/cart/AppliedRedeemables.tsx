import { Coupon, GiftCertificate } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { AppliedCoupon } from '../coupon';
import { AppliedGiftCertificate } from '../giftCertificate';

import AppliedRedeemable from './AppliedRedeemable';

export interface AppliedRedeemablesProps {
    coupons?: Coupon[];
    giftCertificates?: GiftCertificate[];
    isRemovingGiftCertificate?: boolean;
    isRemovingCoupon?: boolean;
    onRemovedCoupon(code: string): void;
    onRemovedGiftCertificate(code: string): void;
}

const AppliedRedeemables: FunctionComponent<AppliedRedeemablesProps> = ({
    coupons = [],
    giftCertificates = [],
    isRemovingCoupon = false,
    isRemovingGiftCertificate = false,
    onRemovedCoupon,
    onRemovedGiftCertificate,
}) => {
    if (!coupons.length && !giftCertificates.length) {
        return null;
    }

    return (
        <ul data-test="redeemables-list" className="form-checklist optimizedCheckout-form-checklist">
            { coupons.map(coupon => (
                <li key={ coupon.code } className="form-checklist-item optimizedCheckout-form-checklist-item">
                    <AppliedRedeemable
                        onRemove={ () => onRemovedCoupon(coupon.code) }
                        isRemoving={ isRemovingCoupon }
                    >
                        <AppliedCoupon coupon={ coupon } />
                    </AppliedRedeemable>
                </li>
            )) }
            { giftCertificates.map(giftCertificate => (
                <li key={ giftCertificate.code } className="form-checklist-item optimizedCheckout-form-checklist-item">
                    <AppliedRedeemable
                        onRemove={ () => onRemovedGiftCertificate(giftCertificate.code) }
                        isRemoving={ isRemovingGiftCertificate }
                    >
                        <AppliedGiftCertificate giftCertificate={ giftCertificate } />
                    </AppliedRedeemable>
                </li>
            )) }
        </ul>
    );
};

export default AppliedRedeemables;
