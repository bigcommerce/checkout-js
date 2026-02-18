import { type Coupon } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useRef } from 'react';
import { TransitionGroup } from 'react-transition-group';

import { CollapseCSSTransition, IconCoupon, IconGiftCertificateNew, IconRemoveCoupon } from '@bigcommerce/checkout/ui';

import { useMultiCoupon } from '../useMultiCoupon';

interface AnimatedCouponTagProps {
    children: React.ReactNode;
    in?: boolean;
    onExited?: () => void;
}

const AnimatedCouponTag: FunctionComponent<AnimatedCouponTagProps> = ({ children, in: inProp, onExited }) => {
    const nodeRef = useRef<HTMLDivElement>(null);

    return (
        <CollapseCSSTransition
            classNames="coupon-tag"
            in={inProp}
            isSlideAnimation
            nodeRef={nodeRef}
            onExited={onExited}
        >
            <div className="coupon-tag-wrapper" ref={nodeRef}>
                {children}
            </div>
        </CollapseCSSTransition>
    );
};

const AppliedCouponsPills: FunctionComponent<{ coupons: Coupon[], removeCoupon: (code: string) => void }> = ({ coupons, removeCoupon }) => {
    return (
        <TransitionGroup component={null}>
            {coupons.map(({ code, displayName }) => (
                <AnimatedCouponTag key={code}>
                    <ul>
                        <IconCoupon />
                        {displayName ? `${displayName} (${code})` : code}
                        <IconRemoveCoupon onClick={() => removeCoupon(code)} />
                    </ul>
                </AnimatedCouponTag>
            ))}
        </TransitionGroup>
    );
};

export const ManageCouponsAndGiftCertificates: FunctionComponent = () => {
    const {
        appliedCoupons,
        appliedGiftCertificates,
        removeCoupon,
        removeGiftCertificate,
    } = useMultiCoupon();

    return (
        <>
            <AppliedCouponsPills
                coupons={appliedCoupons}
                removeCoupon={removeCoupon}
            />
            <TransitionGroup component={null}>
                {appliedGiftCertificates.map(({ code }) => (
                    <AnimatedCouponTag key={code}>
                        <ul>
                            <IconGiftCertificateNew />
                            {code}
                            <IconRemoveCoupon onClick={() => removeGiftCertificate(code)} />
                        </ul>
                    </AnimatedCouponTag>
                ))}
            </TransitionGroup>
        </>
    );
};
