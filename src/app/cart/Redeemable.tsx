import { CheckoutSelectors, RequestError } from '@bigcommerce/checkout-sdk';
import { withFormik, FieldProps, FormikProps } from 'formik';
import { noop } from 'lodash';
import React, { memo, useCallback, Fragment, FunctionComponent, KeyboardEvent } from 'react';
import { object, string } from 'yup';

import { preventDefault } from '../common/dom';
import { memoize } from '../common/utility';
import { withLanguage, TranslatedString, WithLanguageProps } from '../locale';
import { Alert, AlertType } from '../ui/alert';
import { Button, ButtonVariant } from '../ui/button';
import { FormContextType, FormField, FormProvider, Label, TextInput } from '../ui/form';
import { Toggle } from '../ui/toggle';

import AppliedRedeemables, { AppliedRedeemablesProps } from './AppliedRedeemables';

export interface RedeemableFormValues {
    redeemableCode: string;
}

export type ReedemableChildrenProps = Pick<RedeemableProps,
    'onRemovedCoupon' |
    'onRemovedGiftCertificate' |
    'isRemovingGiftCertificate' |
    'isRemovingCoupon' |
    'coupons' |
    'giftCertificates'
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

const Redeemable: FunctionComponent<RedeemableProps & WithLanguageProps & FormikProps<RedeemableFormValues>> = ({
    shouldCollapseCouponCode,
    showAppliedRedeemables,
    ...formProps
}) => (
    <Toggle openByDefault={ !shouldCollapseCouponCode }>
        { ({ toggle, isOpen }) => (
            <Fragment>
                { shouldCollapseCouponCode && <a
                    className="redeemable-label"
                    data-test="redeemable-label"
                    href="#"
                    onClick={ preventDefault(toggle) }
                >
                    <TranslatedString id="redeemable.toggle_action" />
                </a> }
                { !shouldCollapseCouponCode && <div className="redeemable-label">
                    <TranslatedString id="redeemable.toggle_action" />
                </div> }
                { (isOpen || !shouldCollapseCouponCode) && <div data-test="redeemable-collapsable">
                    <RedeemableForm { ...formProps } />
                    { showAppliedRedeemables &&
                        <AppliedRedeemables { ...formProps } />
                    }
                </div> }
            </Fragment>
        ) }
    </Toggle>
);

const RedeemableForm: FunctionComponent<Partial<RedeemableProps> & FormikProps<RedeemableFormValues>> = ({
    appliedRedeemableError,
    isApplyingRedeemable,
    clearError = noop,
    submitForm,
}) => {
    const handleKeyDown = useCallback(memoize((setSubmitted: FormContextType['setSubmitted']) => (
        (event: KeyboardEvent) => {
            if (appliedRedeemableError) {
                clearError(appliedRedeemableError);
            }

            // note: to prevent submitting main form, we manually intercept
            // the enter key event and submit the "subform".
            if (event.keyCode === 13) {
                setSubmitted(true);
                submitForm();
                event.preventDefault();
            }
        }
    )), [
        appliedRedeemableError,
        clearError,
        submitForm,
    ]);

    const handleSubmit = useCallback(memoize((setSubmitted: FormContextType['setSubmitted']) => (
        () => {
            setSubmitted(true);
            submitForm();
        }
    )), []);

    const renderLabel = useCallback((name: string) => (
        <Label hidden htmlFor={ name }>
            <TranslatedString id="redeemable.code_label" />
        </Label>
    ), []);

    const renderInput = useCallback((setSubmitted: FormContextType['setSubmitted']) => ({ field }: FieldProps) => (
        <Fragment>
            { appliedRedeemableError && <Alert type={ AlertType.Error }>
                { appliedRedeemableError.errors[0].code === 'not_applicable' ?
                    <TranslatedString id="redeemable.coupon_location_error" /> :
                    <TranslatedString id="redeemable.code_invalid_error" />
                }
            </Alert> }

            <div className="form-prefixPostfix">
                <TextInput
                    { ...field }
                    onKeyDown={ handleKeyDown(setSubmitted) }
                    className="form-input optimizedCheckout-form-input"
                    testId="redeemableEntry-input"
                />

                <Button
                    className="form-prefixPostfix-button--postfix"
                    testId="redeemableEntry-submit"
                    id="applyRedeemableButton"
                    variant={ ButtonVariant.Secondary }
                    isLoading={ isApplyingRedeemable }
                    onClick={ handleSubmit(setSubmitted) }
                >
                    <TranslatedString id="redeemable.apply_action" />
                </Button>
            </div>
        </Fragment>
    ), [
        appliedRedeemableError,
        handleKeyDown,
        handleSubmit,
        isApplyingRedeemable,
    ]);

    const renderContent = useCallback(memoize(({ setSubmitted }: FormContextType) => (
        <FormField
            name="redeemableCode"
            label={ renderLabel }
            input={ renderInput(setSubmitted) }
        />
    )), [
        renderLabel,
        renderInput,
    ]);

    return <fieldset className="form-fieldset redeemable-entry">
        <FormProvider>
            { renderContent }
        </FormProvider>
    </fieldset>;
};

export default withLanguage(withFormik<RedeemableProps & WithLanguageProps, RedeemableFormValues>({
    mapPropsToValues() {
        return {
            redeemableCode: '',
        };
    },

    async handleSubmit({ redeemableCode }, { props: { applyCoupon, applyGiftCertificate, clearError } }) {
        const code = redeemableCode.trim();

        try {
            await applyGiftCertificate(code);
        } catch (error) {
            clearError(error);
            applyCoupon(code);
        }
    },

    validationSchema({ language }: RedeemableProps & WithLanguageProps) {
        return object({
            redeemableCode: string()
                .required(language.translate('redeemable.code_required_error')),
        });
    },
})(memo(Redeemable)));
