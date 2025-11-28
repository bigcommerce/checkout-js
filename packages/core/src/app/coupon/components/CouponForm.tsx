import classNames from 'classnames';
import React, { type FunctionComponent, useState } from 'react';

import { useLocale, useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconCoupon, IconError, IconRemoveCoupon, TextInput } from '@bigcommerce/checkout/ui';

import { Button, ButtonVariant } from '../../ui/button';

export const CouponForm: FunctionComponent = () => {
    const [applyCouponError, setApplyCouponError] = useState<string | null>(null);
    const { themeV2 } = useThemeContext();
    const { language } = useLocale();

    return (
        <>
            <div className="coupon-form" id="coupon-form-collapsable">
                <TextInput
                    additionalClassName="form-input optimizedCheckout-form-input coupon-input"
                    aria-label={language.translate('redeemable.code_label')}
                    placeholder={language.translate('redeemable.coupon_placeholder')}
                    testId="redeemableEntry-input"
                    themeV2={themeV2}
                />
                <Button
                    className={classNames('coupon-button', {
                        'body-bold': themeV2,
                    })}
                    id="applyRedeemableButton"
                    testId="redeemableEntry-submit"
                    variant={ButtonVariant.Secondary}
                >
                    <TranslatedString id="redeemable.apply_action" />
                </Button>
            </div>
            <div className="applied-coupons-list">
                {Boolean(applyCouponError) &&
                    <ul className="applied-coupon-error-message" role="alert">
                        <IconError />
                        <span>{applyCouponError}</span>
                        <span onClick={() => setApplyCouponError(null)}><IconRemoveCoupon /></span>
                    </ul>
                }
                <ul><IconCoupon />Chicken mugs half price! (ABC11111)<IconRemoveCoupon /></ul>
                <ul><IconCoupon />ABC22222<IconRemoveCoupon /></ul>
                <ul><IconCoupon />New customer 10% off Loooooooooooooonnnnnnnnng(EXTRA12345)<IconRemoveCoupon /></ul>
                <ul><IconCoupon />Free sample (FREE34567)<IconRemoveCoupon /></ul>
            </div>
        </>
    );
};

