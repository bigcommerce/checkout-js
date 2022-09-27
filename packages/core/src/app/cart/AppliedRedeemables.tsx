import { Coupon, GiftCertificate } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo, useCallback } from 'react';

import { AppliedCoupon } from '../coupon';
import { AppliedGiftCertificate } from '../giftCertificate';

import AppliedRedeemable from './AppliedRedeemable';

interface AppliedCouponProps {
    coupon: Coupon;
    isRemoving?: boolean;
    onRemoved(code: string): void;
}

const AppliedCouponChecklistItem: FunctionComponent<AppliedCouponProps> = ({
    coupon,
    onRemoved,
    isRemoving = false,
}) => {
    const handleRemove = useCallback(() => {
        onRemoved(coupon.code);
    }, [coupon, onRemoved]);

    return (
        <li className="form-checklist-item optimizedCheckout-form-checklist-item">
            <AppliedRedeemable isRemoving={isRemoving} onRemove={handleRemove}>
                <AppliedCoupon coupon={coupon} />
            </AppliedRedeemable>
        </li>
    );
};

interface AppliedGiftCertificateProps {
    giftCertificate: GiftCertificate;
    isRemoving?: boolean;
    onRemoved(code: string): void;
}

const AppliedGiftCertificateChecklistItem: FunctionComponent<AppliedGiftCertificateProps> = ({
    giftCertificate,
    onRemoved,
    isRemoving = false,
}) => {
    const handleRemove = useCallback(() => {
        onRemoved(giftCertificate.code);
    }, [giftCertificate, onRemoved]);

    return (
        <li className="form-checklist-item optimizedCheckout-form-checklist-item">
            <AppliedRedeemable isRemoving={isRemoving} onRemove={handleRemove}>
                <AppliedGiftCertificate giftCertificate={giftCertificate} />
            </AppliedRedeemable>
        </li>
    );
};

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
        <ul
            className="form-checklist optimizedCheckout-form-checklist"
            data-test="redeemables-list"
        >
            {coupons.map((coupon) => (
                <AppliedCouponChecklistItem
                    coupon={coupon}
                    isRemoving={isRemovingCoupon}
                    key={coupon.code}
                    onRemoved={onRemovedCoupon}
                />
            ))}

            {giftCertificates.map((giftCertificate) => (
                <AppliedGiftCertificateChecklistItem
                    giftCertificate={giftCertificate}
                    isRemoving={isRemovingGiftCertificate}
                    key={giftCertificate.code}
                    onRemoved={onRemovedGiftCertificate}
                />
            ))}
        </ul>
    );
};

export default memo(AppliedRedeemables);
