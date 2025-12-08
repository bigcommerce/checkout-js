import React, { type FunctionComponent } from 'react';

import { IconCoupon, IconRemoveCoupon } from '@bigcommerce/checkout/ui';

interface AppliedCouponOrGiftCertificateProps {
    code: string;
    onClick: () => void;
}

export const AppliedCouponOrGiftCertificate: FunctionComponent<AppliedCouponOrGiftCertificateProps> = ({
    code,
    onClick,
}) => (
    <ul>
        <IconCoupon />
        {code}
        <IconRemoveCoupon onClick={onClick} />
    </ul>
);

