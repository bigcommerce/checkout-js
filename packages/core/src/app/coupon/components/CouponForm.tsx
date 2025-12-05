import classNames from 'classnames';
import React, { type FunctionComponent, useState } from 'react';

import { useLocale, useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconError, IconRemoveCoupon, TextInput } from '@bigcommerce/checkout/ui';

import { Button, ButtonVariant } from '../../ui/button';
import { useMultiCoupon } from '../useMultiCoupon';

import { AppliedCouponsOrGiftCertificates } from './AppliedCouponsOrGiftCertificates';

export const CouponForm: FunctionComponent = () => {
    const [applyCouponError, setApplyCouponError] = useState<string | null>(null);
    const [code, setCode] = useState<string>('');

    const { themeV2 } = useThemeContext();
    const { language } = useLocale();
    const { applyCouponOrGiftCertificate } = useMultiCoupon();

    const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCode(event.currentTarget.value.trim());
    };

    const submitForm = async () => {
        try {
            await applyCouponOrGiftCertificate(code);

            setCode('');
        } catch (error) {
            // TODO: Handle different error types accordingly
            // eslint-disable-next-line no-console
            console.log(error);
        }
    };

    return (
        <>
            <div className="coupon-form" id="coupon-form-collapsable">
                <TextInput
                    additionalClassName="form-input optimizedCheckout-form-input coupon-input"
                    aria-label={language.translate('redeemable.code_label')}
                    onChange={handleTextInputChange}
                    placeholder={language.translate('redeemable.coupon_placeholder')}
                    testId="redeemableEntry-input"
                    themeV2={themeV2}
                    value={code}
                />
                <Button
                    className={classNames('coupon-button', {
                        'body-bold': themeV2,
                    })}
                    id="applyRedeemableButton"
                    onClick={submitForm}
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
                <AppliedCouponsOrGiftCertificates />
            </div>
        </>
    );
};

