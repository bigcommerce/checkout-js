import React, { type FunctionComponent } from 'react';

import { IconCoupon, IconRemoveCoupon } from '@bigcommerce/checkout/ui';

interface AppliedCouponProps {
    code: string;
    onClick?: () => void;
}

export const AppliedCouponOrGiftCertificate: FunctionComponent<AppliedCouponProps> = ({
    code,
    onClick,
}) => (
    <ul>
        <IconCoupon />
        {code}
        <IconRemoveCoupon onClick={onClick} />
    </ul>
);

