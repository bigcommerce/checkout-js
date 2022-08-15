import { CustomerInitializeOptions, CustomerRequestOptions } from '@bigcommerce/checkout-sdk';
import { withFormik, FieldProps, FormikProps } from 'formik';
import React, { memo, useCallback, useEffect, useState, FunctionComponent, ReactNode } from 'react';
import CheckoutStepStatus from '../checkout/CheckoutStepStatus';

import { TranslatedHtml, TranslatedString } from '../locale';
import { PrivacyPolicyField } from '../privacyPolicy';
import { Button, ButtonVariant } from '../ui/button';
import { BasicFormField, Fieldset, Legend } from '../ui/form';
import { LoadingOverlay } from '../ui/loading';

import { GuestFormValues } from './GuestForm';
import SubscribeField from './SubscribeField';

export interface StripeGuestFormProps {
    canSubscribe: boolean;
    step: CheckoutStepStatus;
    checkoutButtons?: ReactNode;
    continueAsGuestButtonLabelId: string;
    email?: string;
    isLoading: boolean;
    requiresMarketingConsent: boolean;
    defaultShouldSubscribe: boolean;
    privacyPolicyUrl?: string;
    onChangeEmail(email: string): void;
    onContinueAsGuest(data: GuestFormValues): void;
    deinitialize(options: CustomerRequestOptions): void;
    initialize(options: CustomerInitializeOptions): void;
    onShowLogin(): void;
    updateStripeLinkAuthenticated(auth: boolean): void;
}

const StripeGuestForm: FunctionComponent<StripeGuestFormProps & FormikProps<GuestFormValues>> = ({
    checkoutButtons,
    continueAsGuestButtonLabelId,
    isLoading,
    initialize,
    deinitialize,
    onChangeEmail,
    onShowLogin,
    onContinueAsGuest,
    canSubscribe,
    requiresMarketingConsent,
    privacyPolicyUrl,
    step,
    updateStripeLinkAuthenticated,
}) => {

    const [continueAsAGuestButton, setContinueAsAGuestButton] = useState(true);
    const [emailValue, setEmailValue] = useState('');
    const [authentication, setAuthentication] = useState(false);
    const [isStripeLoading, setIsStripeLoading] = useState(true);
    const [isNewAuth, setIsNewAuth] = useState(false);
    const handleOnClickSubmitButton = () => {
        onContinueAsGuest({
            email: emailValue || '',
            shouldSubscribe: false,
        });
    };
    const setEmailCallback = useCallback((authenticated: boolean, email: string) => {
        onChangeEmail(email);
        setEmailValue(email);
        setContinueAsAGuestButton(!email);
        updateStripeLinkAuthenticated(authenticated);
        setAuthentication(authenticated);
        if(!authenticated){
            setIsNewAuth(true);
        }
    }, [setContinueAsAGuestButton, onChangeEmail]);

    useEffect(() => {
        if ((!step.isComplete || isNewAuth) && emailValue && authentication) {
            handleOnClickSubmitButton();
        }
    }, [emailValue, authentication, isNewAuth]);

    const handleLoading = useCallback((mounted: boolean) => {
        setIsStripeLoading(mounted);
    }, []);

    const stripeDeinitialize = () => {
        deinitialize({
            methodId: 'stripeupe',
        });
    };

    const stripeInitialize = () => {
        initialize( {
                methodId: 'stripeupe',
                stripeupe: {
                    container: 'stripeupeLink',
                    onEmailChange: setEmailCallback,
                    isLoading: handleLoading,
                },
        })};

    useEffect(() => {
        stripeInitialize();
        return () => stripeDeinitialize();
    }, []);

    const renderField = useCallback((fieldProps: FieldProps<boolean>) => (
        <SubscribeField
            { ...fieldProps }
            requiresMarketingConsent={ requiresMarketingConsent }
        />
    ), [
        requiresMarketingConsent,
    ]);

    return (
        <div className="checkout-form">
            <LoadingOverlay
                hideContentWhenLoading
                isLoading={ isStripeLoading }
            >
            <Fieldset
                legend={ !authentication &&
                    <Legend hidden>
                        <TranslatedString id="customer.guest_customer_text" />
                    </Legend>
                }
            >
                { !authentication && <p>
                    <TranslatedHtml id="customer.checkout_as_guest_text" />
                </p> }
            <div className="customerEmail-container">
                <div className="customerEmail-body">
                    <div id="stripeupeLink"> </div>
                    <br />
                    { (canSubscribe || requiresMarketingConsent) && <BasicFormField
                        name="shouldSubscribe"
                        render={ renderField }
                    /> }

                    { privacyPolicyUrl && <PrivacyPolicyField
                        url={ privacyPolicyUrl }
                    /> }
                </div>

                <div className="form-actions customerEmail-action">
                    { !authentication && <Button
                        className="stripeCustomerEmail-button"
                        disabled={ continueAsAGuestButton }
                        id="stripe-checkout-customer-continue"
                        isLoading={ isLoading }
                        onClick={ handleOnClickSubmitButton }
                        testId="stripe-customer-continue-as-guest-button"
                        type="submit"
                        variant={ ButtonVariant.Primary }
                    >
                        <TranslatedString id={ continueAsGuestButtonLabelId } />
                    </Button> }
                </div>
            </div>
                {
                    !isLoading && <p>
                        <TranslatedString id="customer.login_text" />
                        { ' ' }
                        <a
                            data-test="customer-continue-button"
                            id="checkout-customer-login"
                            onClick={ onShowLogin }
                        >
                            <TranslatedString id="customer.login_action" />
                        </a>
                    </p>
                }

            { checkoutButtons }
            </Fieldset>
            </LoadingOverlay>
        </div>
    );
};

export default withFormik<StripeGuestFormProps, GuestFormValues>({
    mapPropsToValues: ({
                           email = '',
                           defaultShouldSubscribe = false,
                           requiresMarketingConsent,
                       }) => ({
        email,
        shouldSubscribe: requiresMarketingConsent ? false : defaultShouldSubscribe,
        privacyPolicy: false,
    }),
    handleSubmit: (values, { props: { onContinueAsGuest } }) => {
        onContinueAsGuest(values);
    },
})(memo(StripeGuestForm));
