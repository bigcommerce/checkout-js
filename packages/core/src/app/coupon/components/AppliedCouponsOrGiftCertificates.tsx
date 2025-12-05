import React, { type FunctionComponent } from 'react';

import { useMultiCoupon } from '../useMultiCoupon';

import { AppliedCouponOrGiftCertificate } from './AppliedCouponOrGiftCertificate';

export const AppliedCouponsOrGiftCertificates: FunctionComponent = () => {
    const {
        appliedCoupons,
        appliedGiftCertificates,
        removeCoupon,
        removeGiftCertificate,
    } = useMultiCoupon();

    if (appliedCoupons.length === 0 && appliedGiftCertificates.length === 0) {
        return null;
    }

    return (
        <>
            {appliedCoupons.length > 0 &&
                appliedCoupons.map(({ code }) => (
                    <AppliedCouponOrGiftCertificate
                        code={code}
                        key={code}
                        onClick={() => removeCoupon(code)}
                    />
                ))}
            {appliedGiftCertificates.length > 0 &&
                appliedGiftCertificates.map(({ code }) => (
                    <AppliedCouponOrGiftCertificate
                        code={code}
                        key={code}
                        onClick={() => removeGiftCertificate(code)}
                    />
                ))}
        </>
    );
};
