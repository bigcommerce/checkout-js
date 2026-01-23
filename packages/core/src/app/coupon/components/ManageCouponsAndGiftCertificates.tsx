import { type Coupon } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { IconCoupon, IconGiftCertificateNew, IconRemoveCoupon } from '@bigcommerce/checkout/ui';

import { useMultiCoupon } from '../useMultiCoupon';

const ANIMATION_DURATION = 300;
const SLIDE_DISTANCE = 12;

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface AnimatedCouponTagProps {
    children: React.ReactNode;
    in?: boolean;
}

const AnimatedCouponTag: FunctionComponent<AnimatedCouponTagProps> = ({ children, in: inProp }) => {
    const nodeRef = useRef<HTMLDivElement>(null);

    const handleEnter = () => {
        const node = nodeRef.current;
        if (!node || prefersReducedMotion()) return;
        node.style.height = '0px';
        node.style.opacity = '0';
        node.style.transform = `translateY(-${SLIDE_DISTANCE}px)`;
        node.style.overflow = 'hidden';
    };

    const handleEntering = () => {
        const node = nodeRef.current;
        if (!node || prefersReducedMotion()) return;
        void node.offsetHeight;
        node.style.height = `${node.scrollHeight}px`;
        node.style.opacity = '1';
        node.style.transform = 'translateY(0)';
    };

    const handleEntered = () => {
        const node = nodeRef.current;
        if (!node) return;
        node.style.height = '';
        node.style.opacity = '';
        node.style.transform = '';
        node.style.overflow = '';
    };

    const handleExit = () => {
        const node = nodeRef.current;
        if (!node || prefersReducedMotion()) return;
        node.style.height = `${node.offsetHeight}px`;
        node.style.opacity = '1';
        node.style.transform = 'translateY(0)';
        node.style.overflow = 'hidden';
    };

    const handleExiting = () => {
        const node = nodeRef.current;
        if (!node || prefersReducedMotion()) return;
        void node.offsetHeight;
        node.style.height = '0px';
        node.style.opacity = '0';
        node.style.transform = `translateY(-${SLIDE_DISTANCE}px)`;
    };

    return (
        <CSSTransition
            appear
            classNames="coupon-tag"
            in={inProp}
            nodeRef={nodeRef}
            onEnter={handleEnter}
            onEntered={handleEntered}
            onEntering={handleEntering}
            onExit={handleExit}
            onExiting={handleExiting}
            timeout={ANIMATION_DURATION}
        >
            <div className="coupon-tag-wrapper" ref={nodeRef}>
                {children}
            </div>
        </CSSTransition>
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
