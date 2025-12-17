import classNames from 'classnames';
import React, { type FunctionComponent, useState } from 'react';

import { useLocale, useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconError, IconRemoveCoupon, TextInput } from '@bigcommerce/checkout/ui';

import { Button, ButtonVariant } from '../../ui/button';
import { useMultiCoupon } from '../useMultiCoupon';

import { ManageCouponsAndGiftCertificates } from './ManageCouponsAndGiftCertificates';

export const CouponForm: FunctionComponent = () => {
    const [code, setCode] = useState<string>('');

    const { themeV2 } = useThemeContext();
    const { language } = useLocale();
    const {
        applyCouponOrGiftCertificate,
        couponError,
        setCouponError,
        isApplyingCouponOrGiftCertificate,
        isCouponFormDisabled,
    } = useMultiCoupon();

    const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCode(event.currentTarget.value.trim());
    };

    const clearErrorOnClick = () => {
        if (couponError) {
            setCouponError(null);
        }
    };

    const submitForm = async () => {
        if (!code) {
            return;
        }

        try {
            await applyCouponOrGiftCertificate(code);

            setCode('');
        } catch (error) {
            if (error instanceof Error) {
                setCouponError(error.message);
            }
        }
    };

    return (
        <>
            <div className="coupon-form" id="coupon-form-collapsable">
                <TextInput
                    additionalClassName="form-input optimizedCheckout-form-input coupon-input"
                    aria-label={language.translate('redeemable.code_label')}
                    disabled={isCouponFormDisabled}
                    onChange={handleTextInputChange}
                    onClick={clearErrorOnClick}
                    placeholder={language.translate('redeemable.coupon_placeholder')}
                    testId="redeemableEntry-input"
                    themeV2={themeV2}
                    value={code}
                />
                <Button
                    className={classNames('coupon-button', {
                        'body-bold': themeV2,
                    })}
                    disabled={isCouponFormDisabled}
                    id="applyRedeemableButton"
                    isLoading={isApplyingCouponOrGiftCertificate}
                    onClick={submitForm}
                    testId="redeemableEntry-submit"
                    variant={ButtonVariant.Secondary}
                >
                    <TranslatedString id="redeemable.apply_action" />
                </Button>
            </div>
            <div className="applied-coupons-list">
                {Boolean(couponError) &&
                    <ul className="applied-coupon-error-message" role="alert">
                        <IconError />
                        <span>{couponError}</span>
                        <span onClick={() => setCouponError(null)}><IconRemoveCoupon /></span>
                    </ul>
                }
                <ManageCouponsAndGiftCertificates />
            </div>
        </>
    );
};

