import React, { type FunctionComponent, useState } from 'react';

import { useLocale, useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import {
    Alert,
    AlertType,
    Button,
    ButtonVariant,
    IconRemoveCoupon,
    TextInput,
} from '@bigcommerce/checkout/ui';

import { useMultiCoupon } from '../useMultiCoupon';

import { ManageCouponsAndGiftCertificates } from './ManageCouponsAndGiftCertificates';

export interface CouponFormProps {
    formInstanceId?: string;
}

export const CouponForm: FunctionComponent<CouponFormProps> = ({ formInstanceId = '' }) => {
    const [code, setCode] = useState<string>('');
    const { enhancedThemeV1 } = useThemeContext();

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
            setCouponError(language.translate('redeemable.code_required_error'));

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

    // This input can render inside the payment <form>; Enter must not submit it.
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            void submitForm();
        }
    };

    return (
        <>
            <div
                className="coupon-form"
                data-test="redeemable-collapsable"
                id={`${formInstanceId}coupon-form-collapsable`}
            >
                <label className="is-srOnly" htmlFor={`${formInstanceId}redeemableCode`}>
                    <TranslatedString id="redeemable.toggle_action" />
                </label>
                <TextInput
                    additionalClassName="form-input optimizedCheckout-form-input coupon-input"
                    aria-label={language.translate('redeemable.code_label')}
                    disabled={isCouponFormDisabled}
                    id={`${formInstanceId}redeemableCode`}
                    name="redeemableCode"
                    onChange={handleTextInputChange}
                    onClick={clearErrorOnClick}
                    onKeyDown={handleKeyDown}
                    placeholder={language.translate('redeemable.coupon_placeholder')}
                    testId="redeemableEntry-input"
                    value={code}
                />
                <Button
                    className="coupon-button optimizedCheckout-contentPrimary body-bold"
                    disabled={isCouponFormDisabled}
                    id={`${formInstanceId}applyRedeemableButton`}
                    isLoading={isApplyingCouponOrGiftCertificate}
                    onClick={submitForm}
                    testId="redeemableEntry-submit"
                    variant={ButtonVariant.Secondary}
                >
                    <TranslatedString id="redeemable.apply_action" />
                </Button>
            </div>
            <div className="applied-coupons-list">
                {Boolean(couponError) && (
                    <Alert
                        additionalClassName={enhancedThemeV1 ? '' : 'no-padding'}
                        type={AlertType.Error}
                    >
                        <ul className="applied-coupon-error-message">
                            <li>
                                <span>{couponError}</span>
                                <span onClick={() => setCouponError(null)}>
                                    <IconRemoveCoupon />
                                </span>
                            </li>
                        </ul>
                    </Alert>
                )}
                <ManageCouponsAndGiftCertificates />
            </div>
        </>
    );
};
