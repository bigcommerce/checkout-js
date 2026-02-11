import React, { type FunctionComponent, useState } from 'react';

import { useLocale } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Alert, AlertType, IconRemoveCoupon, TextInput } from '@bigcommerce/checkout/ui';

import { Button, ButtonVariant } from '../../ui/button';
import { useMultiCoupon } from '../useMultiCoupon';

import { ManageCouponsAndGiftCertificates } from './ManageCouponsAndGiftCertificates';

export const CouponForm: FunctionComponent = () => {
    const [code, setCode] = useState<string>('');

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
            <div
                className="coupon-form"
                data-test="redeemable-collapsable"
                id="coupon-form-collapsable"
            >
                <label className="is-srOnly" htmlFor="redeemableCode">
                    <TranslatedString id="redeemable.toggle_action" />
                </label>
                <TextInput
                    additionalClassName="form-input optimizedCheckout-form-input coupon-input"
                    aria-label={language.translate('redeemable.code_label')}
                    disabled={isCouponFormDisabled}
                    id="redeemableCode"
                    name="redeemableCode"
                    onChange={handleTextInputChange}
                    onClick={clearErrorOnClick}
                    placeholder={language.translate('redeemable.coupon_placeholder')}
                    testId="redeemableEntry-input"
                    value={code}
                />
                <Button
                    className="coupon-button body-bold"
                    disabled={isCouponFormDisabled}
                    id="applyRedeemableButton"
                    isLoading={isApplyingCouponOrGiftCertificate}
                    onClick={submitForm}
                    testId="redeemableEntry-submit"
                    variant={ButtonVariant.Secondary}
                >
                    <TranslatedString id="redeemable.apply_action"/>
                </Button>
            </div>
            <div className="applied-coupons-list">
                {Boolean(couponError) &&
                    <Alert additionalClassName="no-padding" type={AlertType.Error}>
                        <ul className="applied-coupon-error-message">
                            <span>{couponError}</span>
                            <span onClick={() => setCouponError(null)}><IconRemoveCoupon /></span>
                        </ul>
                    </Alert>
                }
                <ManageCouponsAndGiftCertificates />
            </div>
        </>
    );
};

