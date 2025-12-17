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

    const isCouponApplied = appliedCoupons.length > 0;
    const isGiftCertificateApplied = appliedGiftCertificates.length > 0;

    if (!isCouponApplied && !isGiftCertificateApplied) {
        return null;
    }

    return (
        <>
            {isCouponApplied &&
                appliedCoupons.map(({ code, displayName }) => (
                    <ul key={code}>
                        <IconCoupon />
                        {displayName ? `${displayName} (${code})` : code}
                        <IconRemoveCoupon
                            onClick={() => removeCoupon(code)}
                        />
                    </ul>
                ))
            }
            {isGiftCertificateApplied &&
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
