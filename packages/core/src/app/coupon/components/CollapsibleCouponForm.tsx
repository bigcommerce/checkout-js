import React, { type FunctionComponent, useRef, useState } from 'react';

import { useCapabilities } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CollapseCSSTransition } from '@bigcommerce/checkout/ui';

import { useMultiCoupon } from '../useMultiCoupon';
import { getRedeemableLabelId } from '../utils';

import { CouponForm } from './CouponForm';

interface CollapsibleCouponFormProps {
    formInstanceId?: string;
}

export const CollapsibleCouponForm: FunctionComponent<CollapsibleCouponFormProps> = ({
    formInstanceId = '',
}) => {
    const { isCouponFormCollapsed } = useMultiCoupon();

    const {
        userJourney: { disableCoupon, disableGiftCertificate },
    } = useCapabilities();

    const [isCouponFormVisible, setIsCouponFormVisible] = useState(!isCouponFormCollapsed);
    const couponFormRef = useRef<HTMLDivElement>(null);

    const toggleCouponForm = () => {
        setIsCouponFormVisible((prevState) => !prevState);
    };

    return (
        <>
            <a
                aria-controls={`${formInstanceId}coupon-form-collapsable`}
                aria-expanded={isCouponFormVisible}
                className="redeemable-label body-cta"
                data-test="redeemable-label"
                href="#"
                onClick={preventDefault(toggleCouponForm)}
            >
                <TranslatedString
                    id={getRedeemableLabelId(disableGiftCertificate, disableCoupon)}
                />
            </a>

            <CollapseCSSTransition isVisible={isCouponFormVisible} nodeRef={couponFormRef}>
                <div className="coupon-form-wrapper" ref={couponFormRef}>
                    <CouponForm formInstanceId={formInstanceId} />
                </div>
            </CollapseCSSTransition>
        </>
    );
};
