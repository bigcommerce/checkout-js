import { CheckoutSelectors, RequestError } from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import { withFormik, FieldProps, FormikProps } from 'formik';
import { noop } from 'lodash';
import React, { memo, useCallback, Fragment, FunctionComponent, KeyboardEvent } from 'react';
import { object, string } from 'yup';

import { preventDefault } from '../common/dom';
import { withLanguage, TranslatedString, WithLanguageProps } from '../locale';
import { Alert, AlertType } from '../ui/alert';
import { Button, ButtonVariant } from '../ui/button';
import { FormContextType, FormField, FormProvider, Label, TextInput } from '../ui/form';
import { Toggle } from '../ui/toggle';

import AppliedRedeemables, { AppliedRedeemablesProps } from './AppliedRedeemables';

import { Checkout } from '@bigcommerce/checkout-sdk';

import giveXCertBalance from '../fetcher/giveXCertBalance';
import bcCertCreate from '../fetcher/bcCertCreate';

export interface RedeemableFormValues {
    giftcardNumber: string;
    giftcardPIN: string;
    checkout?: Checkout;
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
    checkout?: Checkout;
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

// need a better way to keep track the state of these values
var name:string, email:string;
var button:string;
var balance:string;

const Redeemable: FunctionComponent<RedeemableProps & WithLanguageProps & FormikProps<RedeemableFormValues>> = ({
    shouldCollapseCouponCode,
    showAppliedRedeemables,
    checkout,
    ...formProps
}) => {    
    // need a better way to update/pass these values
    if (checkout != undefined) {
        name=checkout?.billingAddress?.firstName+' '+checkout?.billingAddress?.lastName
        email=checkout?.cart.email;
    }

    return (
    <Toggle openByDefault={ !shouldCollapseCouponCode }>
        { 
        ({ toggle, isOpen }) => (
            <Fragment>
                { shouldCollapseCouponCode && <a
                    className="redeemable-label"
                    data-test="redeemable-label"
                    href="#"
                    onClick={ preventDefault(toggle) }
                >
                    <TranslatedString id="giftcard.pay_toggle" />
                </a> }
                { !shouldCollapseCouponCode && <div className="redeemable-label">
                    <TranslatedString id="giftcard.pay_toggle" />
                </div> }
                { (isOpen || !shouldCollapseCouponCode) && <div data-test="redeemable-collapsable">
                    <RedeemableForm { ...formProps } />
                    { showAppliedRedeemables &&
                        <AppliedRedeemables { ...formProps } /> }
                </div> }                
                {/* [{ JSON.stringify(checkout)}] */}
            </Fragment>
        ) }
    </Toggle>
);
}

const RedeemableForm: FunctionComponent<Partial<RedeemableProps> & FormikProps<RedeemableFormValues>> = ({
    appliedRedeemableError,
    isApplyingRedeemable,
    clearError = noop,
    submitForm,    
}) => {
    const handleKeyDown = useCallback(memoizeOne((setSubmitted: FormContextType['setSubmitted']) => (
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

    const handleSubmit = useCallback(memoizeOne((buttonType: string,setSubmitted: FormContextType['setSubmitted']) => (
        () => {
            button=buttonType
            setSubmitted(true);
            submitForm();
        }
    )), []);

    const renderLabel = useCallback((name: string) => (
        <Label hidden htmlFor={ name }>
            <TranslatedString id="redeemable.code_label" />
        </Label>
    ), []);

    const renderErrorMessage = useCallback((errorCode: string) => {
        switch (errorCode) {
        case 'min_purchase':
            return <TranslatedString id="redeemable.coupon_min_order_total" />;
        case 'not_applicable':
            return <TranslatedString id="redeemable.coupon_location_error" />;
        default:
            return <TranslatedString id="redeemable.code_invalid_error" />;
        }
    }, []);

    const renderGCNumberInput = useCallback((setSubmitted: FormContextType['setSubmitted']) => ({ field }: FieldProps) => (
        <Fragment>
            { appliedRedeemableError && appliedRedeemableError.errors && appliedRedeemableError.errors[0] &&
                <Alert type={ AlertType.Error }>
                    { renderErrorMessage(appliedRedeemableError.errors[0].code) }
                </Alert> }

            <div className="form-prefixPostfix">
                <TranslatedString id="giftcard.number" />
            </div>    
            <div className="form-prefixPostfix">
                <TextInput
                    { ...field }
                    className="form-input optimizedCheckout-form-input"
                    onKeyDown={ handleKeyDown(setSubmitted) }
                    testId="giftcardNumber-input"
                />
                <Button
                    className="form-prefixPostfix-button--postfix"
                    id="giveXCheckButton"
                    onClick={ handleSubmit('givexBalance',setSubmitted) }
                    isLoading={ isApplyingRedeemable }
                    testId="giveXCheck-submit"
                    variant={ ButtonVariant.Secondary }
                >
                    <TranslatedString id="giftcard.balance" />
                </Button>
            </div>
        </Fragment>
    ), [
        appliedRedeemableError,
        handleKeyDown,
        handleSubmit,
        isApplyingRedeemable,
        renderErrorMessage,
    ]);

    const renderGCPINInput = useCallback((setSubmitted: FormContextType['setSubmitted']) => ({ field }: FieldProps) => (
        <Fragment>
            { appliedRedeemableError && appliedRedeemableError.errors && appliedRedeemableError.errors[0] &&
                <Alert type={ AlertType.Error }>
                    { renderErrorMessage(appliedRedeemableError.errors[0].code) }
                </Alert> }

            <div className="form-prefixPostfix">
                <TranslatedString id="giftcard.pin" />
            </div>
            <div className="form-prefixPostfix">
                <TextInput
                    { ...field }
                    className="form-input optimizedCheckout-form-input"
                    onKeyDown={ handleKeyDown(setSubmitted) }
                    testId="giftcardPIN-input"
                />
                <Button
                    className="form-prefixPostfix-button--postfix"
                    id="applyRedeemableButton"
                    isLoading={ isApplyingRedeemable }
                    onClick={ handleSubmit('givexApply',setSubmitted) }
                    testId="redeemableEntry-submit"
                    variant={ ButtonVariant.Secondary }
                >
                    <TranslatedString id="giftcard.apply_action" />
                </Button>
            </div>
        </Fragment>
    ), [
        appliedRedeemableError,
        handleKeyDown,
        handleSubmit,
        isApplyingRedeemable,
        renderErrorMessage,
    ]);

    const renderContent = useCallback(memoizeOne(({ setSubmitted }: FormContextType) =>{
    return (
        <>
        <FormField
            input={ renderGCNumberInput(setSubmitted) }
            label={ renderLabel }
            name="giftcardNumber"
        />
        { balance && <Alert type={ AlertType.Info }>{balance}</Alert>}
        <FormField
            input={ renderGCPINInput(setSubmitted) }
            label={ renderLabel }
            name="giftcardPIN"
        />
        </>
    )}), [
        renderLabel,
        renderGCNumberInput,
        renderGCPINInput,
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
            giftcardNumber: '',
            giftcardPIN: ''
        };
    },
    async handleSubmit({ giftcardNumber,giftcardPIN }, { props: { applyCoupon, applyGiftCertificate, clearError } }) {
        const gcNum = giftcardNumber.trim();
        const gcPIN = giftcardPIN.trim();

        let code = '';
        try {
            if (button === 'givexBalance') {
                balance = await giveXCertBalance(gcNum,gcPIN);
                // need a better way to update balance
                await applyGiftCertificate('none');
            }
            else if (button === 'givexApply') {
                code = await bcCertCreate(gcNum,gcPIN,name,email);
                await applyGiftCertificate(code);
            }
        } catch (error) {
            clearError(error);
            applyCoupon(code);
        }
    },

    validationSchema({ language }: RedeemableProps & WithLanguageProps) {
        return object({
            giftcardNumber: string()
                .required(language.translate('giftcard.number_required_error')),
            giftcardPIN: string()
                .required(language.translate('giftcard.pin_required_error')),

        });
    },
})(memo(Redeemable)));
