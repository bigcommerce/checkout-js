import React, { type FunctionComponent } from 'react';

import { IconCoupon, IconGiftCertificateNew, IconRemoveCoupon } from '@bigcommerce/checkout/ui';

import { useMultiCoupon } from '../useMultiCoupon';

export const ManageCouponsAndGiftCertificates: FunctionComponent = () => {
    const {
        appliedCoupons,
        appliedGiftCertificates,
        removeCoupon,
        removeGiftCertificate,
    } = useMultiCoupon();

    const isCouponUsed = appliedCoupons.length > 0;
    const isGiftCertificateUsed = appliedGiftCertificates.length > 0;

    if (!isCouponUsed && !isGiftCertificateUsed) {
        return null;
    }

    return (
        <>
            {isCouponUsed &&
                appliedCoupons.map(({ code }) => (
                    <ul key={code}>
                        <IconCoupon />
                        {code}
                        <IconRemoveCoupon
                            onClick={() => removeCoupon(code)}
                        />
                    </ul>
                ))
            }
            {isGiftCertificateUsed &&
                appliedGiftCertificates.map(({ code }) => (
                    <ul key={code}>
                        <IconGiftCertificateNew />
                        {code}
                        <IconRemoveCoupon
                            onClick={() => removeGiftCertificate(code)}
                        />
                    </ul>
                ))
            }
        </>
    );
};
