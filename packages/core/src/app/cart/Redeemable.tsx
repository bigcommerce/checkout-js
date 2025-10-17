import { type CheckoutSelectors, type RequestError } from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import classNames from 'classnames';
import { type FieldProps, type FormikProps, withFormik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent, type KeyboardEvent, memo, type ReactNode, useCallback } from 'react';
import { object, string } from 'yup';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString, withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { type FormContextType, FormProvider } from '@bigcommerce/checkout/ui';

import { Alert, AlertType } from '../ui/alert';
import { Button, ButtonVariant } from '../ui/button';
import { FormField, Label, TextInput } from '../ui/form';
import { Toggle } from '../ui/toggle';

import AppliedRedeemables, { type AppliedRedeemablesProps } from './AppliedRedeemables';

export interface RedeemableFormValues {
    redeemableCode: string;
}

export type ReedemableChildrenProps = Pick<
    RedeemableProps,
    | 'onRemovedCoupon'
    | 'onRemovedGiftCertificate'
    | 'isRemovingGiftCertificate'
    | 'isRemovingCoupon'
    | 'coupons'
    | 'giftCertificates'
>;

export type RedeemableProps = {
    appliedRedeemableError?: RequestError;
    isApplyingRedeemable?: boolean;
    isRemovingRedeemable?: boolean;
    removedRedeemableError?: RequestError;
    showAppliedRedeemables?: boolean;
    shouldCollapseCouponCode?: boolean;
    applyCoupon(code: string): Promise<CheckoutSelectors>;
    applyGiftCertificate(code: string): Promise<CheckoutSelectors>;
    clearError(error: Error): void;
} & AppliedRedeemablesProps;

const Redeemable: FunctionComponent<
    RedeemableProps & WithLanguageProps & FormikProps<RedeemableFormValues>
    > = ({ shouldCollapseCouponCode, showAppliedRedeemables, ...formProps }) => {
        const { themeV2 } = useThemeContext();

        return (
            <Toggle openByDefault={!shouldCollapseCouponCode}>
                {({ toggle, isOpen }): ReactNode => (
                    <>
                        {shouldCollapseCouponCode && (
                            <a
                                aria-controls="redeemable-collapsable"
                                aria-expanded={isOpen}
                                className={classNames('redeemable-label', { 'body-cta': themeV2 })}
                                data-test="redeemable-label"
                                href="#"
                                onClick={preventDefault(toggle)}
                            >
                                <TranslatedString id="redeemable.toggle_action" />
                            </a>
                        )}
                        {!shouldCollapseCouponCode && (
                            <div className={classNames('redeemable-label', { 'body-cta': themeV2 })}>
                                <TranslatedString id="redeemable.toggle_action" />
                            </div>
                        )}
                        {(isOpen || !shouldCollapseCouponCode) && (
                            <div data-test="redeemable-collapsable" id="redeemable-collapsable">
                                <RedeemableForm {...formProps} />
                                {showAppliedRedeemables && <AppliedRedeemables {...formProps} />}
                            </div>
                        )}
                    </>
                )}
            </Toggle>
        );
    }

const RedeemableForm: FunctionComponent<
    Partial<RedeemableProps> & FormikProps<RedeemableFormValues> & WithLanguageProps
> = ({ appliedRedeemableError, isApplyingRedeemable, clearError = noop, submitForm, language }) => {
    const {
        checkoutState: {
            statuses: { isSubmittingOrder }
        }
    } = useCheckout();
    const { themeV2 } = useThemeContext();

    const handleSubmitForm = (setSubmitted: FormContextType['setSubmitted']) => {
        if (isSubmittingOrder()) {
            return;
        }

        setSubmitted(true);
        submitForm();
    }

    const handleKeyDown = useCallback(
        memoizeOne((setSubmitted: FormContextType['setSubmitted']) => (event: KeyboardEvent) => {
            if (appliedRedeemableError) {
                clearError(appliedRedeemableError);
            }

            // note: to prevent submitting main form, we manually intercept
            // the enter key event and submit the "subform".
            if (event.keyCode === 13 || event.key === 'Enter') {
                handleSubmitForm(setSubmitted);
                event.preventDefault();
            }
        }),
        [appliedRedeemableError, clearError, submitForm],
    );

    const handleSubmit = useCallback(
        memoizeOne((setSubmitted: FormContextType['setSubmitted']) => () => {
            handleSubmitForm(setSubmitted);
        }),
        [],
    );

    const renderLabel = useCallback(
        (name: string) => (
            <Label hidden htmlFor={name}>
                <TranslatedString id="redeemable.code_label" />
            </Label>
        ),
        [],
    );

    const renderErrorMessage = useCallback((errorCode: string, errorMessage?: string) => {
        switch (errorCode) {
            case 'min_purchase':
                return <TranslatedString id="redeemable.coupon_min_order_total" />;

            case 'not_applicable':
                return <TranslatedString id="redeemable.coupon_location_error" />;

            default:
                return errorMessage || <TranslatedString id="redeemable.code_invalid_error" />;
        }
    }, []);

    const renderInput = useCallback(
        (setSubmitted: FormContextType['setSubmitted']) =>
            ({ field }: FieldProps) =>
                (
                    <>
                        {appliedRedeemableError &&
                            appliedRedeemableError.errors &&
                            appliedRedeemableError.errors[0] && (
                                <Alert type={AlertType.Error}>
                                    {renderErrorMessage(appliedRedeemableError.errors[0].code, appliedRedeemableError.errors[0].message)}
                                </Alert>
                            )}

                        <div className="form-prefixPostfix">
                            <TextInput
                                {...field}
                                aria-label={language.translate('redeemable.code_label')}
                                className="form-input optimizedCheckout-form-input"
                                onKeyDown={handleKeyDown(setSubmitted)}
                                testId="redeemableEntry-input"
                                themeV2={themeV2}
                            />

                            <Button
                                className={classNames('form-prefixPostfix-button--postfix', {
                                    'body-bold': themeV2,
                                })}
                                disabled={isSubmittingOrder()}
                                id="applyRedeemableButton"
                                isLoading={isApplyingRedeemable}
                                onClick={handleSubmit(setSubmitted)}
                                testId="redeemableEntry-submit"
                                variant={ButtonVariant.Secondary}
                            >
                                <TranslatedString id="redeemable.apply_action" />
                            </Button>
                        </div>
                    </>
                ),
        [
            appliedRedeemableError,
            handleKeyDown,
            handleSubmit,
            isApplyingRedeemable,
            language,
            isSubmittingOrder,
            renderErrorMessage,
        ],
    );

    const renderContent = useCallback(
        memoizeOne(({ setSubmitted }: FormContextType) => (
            <FormField
                input={renderInput(setSubmitted)}
                label={renderLabel}
                name="redeemableCode"
            />
        )),
        [renderLabel, renderInput],
    );

    return (
        <fieldset className="form-fieldset redeemable-entry">
            <FormProvider>{renderContent}</FormProvider>
        </fieldset>
    );
};

export default withLanguage(
    withFormik<RedeemableProps & WithLanguageProps, RedeemableFormValues>({
        mapPropsToValues() {
            return {
                redeemableCode: '',
            };
        },

        async handleSubmit(
            { redeemableCode },
            { props: { applyCoupon, applyGiftCertificate, clearError } },
        ) {
            const code = redeemableCode.trim();

            try {
                await applyGiftCertificate(code);
            } catch (error) {
                if (error instanceof Error) {
                    clearError(error);
                }

                applyCoupon(code);
            }
        },

        validationSchema({ language }: RedeemableProps & WithLanguageProps) {
            return object({
                redeemableCode: string().required(
                    language.translate('redeemable.code_required_error'),
                ),
            });
        },
    })(memo(Redeemable)),
);
