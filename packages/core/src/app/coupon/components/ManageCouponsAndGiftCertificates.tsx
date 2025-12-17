import { type Coupon } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { IconCoupon, IconGiftCertificateNew, IconRemoveCoupon } from '@bigcommerce/checkout/ui';

import { useMultiCoupon } from '../useMultiCoupon';

const AppliedCouponsPills: FunctionComponent<{ coupons: Coupon[], removeCoupon: (code: string) => void }> = ({ coupons, removeCoupon }) => {
    return (
        <TransitionGroup component={null}>
            {coupons.map(({ code, displayName }) => {
                const nodeRef = React.createRef<HTMLUListElement>();
                return (
                    <CSSTransition
                        classNames="changeHighlight"
                        key={code}
                        nodeRef={nodeRef}
                        timeout={{}}
                    >
                        <ul ref={nodeRef}>
                            <IconCoupon />
                            {displayName ? `${displayName} (${code})` : code}
                            <IconRemoveCoupon
                                onClick={() => removeCoupon(code)}
                            />
                        </ul>
                    </CSSTransition>
            );
        })}
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

    const isCouponApplied = appliedCoupons.length > 0;
    const isGiftCertificateApplied = appliedGiftCertificates.length > 0;

    if (!isCouponApplied && !isGiftCertificateApplied) {
        return null;
    }

    return (
        <>
            {isCouponApplied &&
                <AppliedCouponsPills
                    coupons={appliedCoupons}
                    removeCoupon={removeCoupon}
                />
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
