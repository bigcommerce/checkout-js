import { CustomerInitializeOptions, CustomerRequestOptions } from '@bigcommerce/checkout-sdk';
import { FieldProps, FormikProps, withFormik } from 'formik';
import React, { FunctionComponent, memo, ReactNode, useCallback, useEffect, useState } from 'react';

import { getAppliedStyles } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { CustomerSkeleton } from '@bigcommerce/checkout/ui';

import CheckoutStepStatus from '../checkout/CheckoutStepStatus';
import { getPrivacyPolicyValidationSchema, PrivacyPolicyField } from '../privacyPolicy';
import { Button, ButtonVariant } from '../ui/button';
import { BasicFormField, Fieldset, Form, Legend } from '../ui/form';

import { GuestFormValues } from './GuestForm';
import SubscribeField from './SubscribeField';

export interface StripeGuestFormProps {
    canSubscribe: boolean;
    checkoutButtons?: ReactNode;
    step: CheckoutStepStatus;
    continueAsGuestButtonLabelId: string;
    email?: string;
    isLoading: boolean;
    isExpressPrivacyPolicy: boolean;
    requiresMarketingConsent: boolean;
    defaultShouldSubscribe: boolean;
    privacyPolicyUrl?: string;
    onChangeEmail(email: string): void;
    onContinueAsGuest(data: GuestFormValues): void;
    deinitialize(options: CustomerRequestOptions): void;
    initialize(options: CustomerInitializeOptions): void;
    onShowLogin(): void;
}

const StripeGuestForm: FunctionComponent<StripeGuestFormProps & FormikProps<GuestFormValues>> = ({
    continueAsGuestButtonLabelId,
    isLoading,
    initialize,
    isExpressPrivacyPolicy,
    deinitialize,
    onChangeEmail,
    onShowLogin,
    onContinueAsGuest,
    canSubscribe,
    checkoutButtons,
    requiresMarketingConsent,
    privacyPolicyUrl,
    step,
    status
}) => {

    const [continueAsAGuestButton, setContinueAsAGuestButton] = useState(true);
    const [emailValue, setEmailValue] = useState('');
    const [authentication, setAuthentication] = useState(false);
    const [isStripeLoading, setIsStripeLoading] = useState(true);
    const [isNewAuth, setIsNewAuth] = useState(false);
    const handleOnClickSubmitButton = () => {
        onContinueAsGuest({
            email: emailValue,
            shouldSubscribe: !!status?.shouldSubscribe,
        });
    };
    const setEmailCallback = useCallback((authenticated: boolean, email: string) => {
        onChangeEmail(email);
        setEmailValue(email);
        setContinueAsAGuestButton(!email);
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

    useEffect(() => {
        if (status?.valSuccess) {
            handleOnClickSubmitButton();
        }
    }, [status?.valSuccess]);

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
                getStyles: getStripeStyles,
                gatewayId: 'stripeupe',
                methodId: 'card',
            },
        })};

    useEffect(() => {
        stripeInitialize();

        return () => stripeDeinitialize();
    }, []);

    const getStylesFromElement = (
        id: string,
        properties: string[]) => {
        const parentContainer = document.getElementById(id);

        if (parentContainer) {
            return getAppliedStyles(parentContainer, properties);
        }

            return undefined;

    };

    const containerId = 'stripe-card-component-field';

    const getStripeStyles: () => (Record<string, string> | undefined) = useCallback( () => {
        const formInput = getStylesFromElement(`${containerId}--input`, ['color', 'background-color', 'border-color', 'box-shadow']);
        const formLabel = getStylesFromElement(`${containerId}--label`, ['color']);
        const formError = getStylesFromElement(`${containerId}--error`, ['color']);

        return formLabel && formInput && formError ? {
            labelText: formLabel.color,
            fieldText: formInput.color,
            fieldPlaceholderText: formInput.color,
            fieldErrorText: formError.color,
            fieldBackground: formInput['background-color'],
            fieldInnerShadow: formInput['box-shadow'],
            fieldBorder: formInput['border-color'],
        } : undefined;
    }, [])

    const renderCheckoutThemeStylesForStripeUPE = () => {
        return (
            <div
                className="optimizedCheckout-form-input"
                id={ `${containerId}--input` }
                placeholder="1111"
            >
                <div
                    className="form-field--error"
                >
                    <div
                        className="optimizedCheckout-form-label"
                        id={ `${containerId}--error` }
                    />
                </div>
                <div
                    className="optimizedCheckout-form-label"
                    id={ `${containerId}--label` }
                />
            </div>
        );
    };

    const renderField = useCallback((fieldProps: FieldProps<boolean>) => (
        <SubscribeField
            { ...fieldProps }
            requiresMarketingConsent={ requiresMarketingConsent }
        />
    ), [
        requiresMarketingConsent,
    ]);

    const buttonText = authentication && !isNewAuth? 'customer.continue_as_stripe_customer_action' : continueAsGuestButtonLabelId;

    return (
        <>
            <CustomerSkeleton isLoading={isStripeLoading}/>
            <Form
                className="checkout-form"
                id="checkout-customer-guest"
                testId="checkout-customer-guest"
            >
                <div className="checkout-form" style={ {display: isStripeLoading ? 'none' : undefined} }>
                    <Fieldset
                        legend={ !authentication &&
                            <Legend hidden>
                                <TranslatedString id="customer.guest_customer_text"/>
                            </Legend>
                        }
                    >
                        <div className="customerEmail-container">
                            <div className="customerEmail-body">
                                <div id="stripeupeLink"/>
                                <br/>
                                { (canSubscribe || requiresMarketingConsent) && <BasicFormField
                                    name="shouldSubscribe"
                                    render={ renderField }
                                /> }
                            </div>

                            <div className="form-actions customerEmail-action">
                                { (!authentication || (authentication && !isNewAuth )) && <Button
                                    className="stripeCustomerEmail-button"
                                    disabled={ continueAsAGuestButton }
                                    id="stripe-checkout-customer-continue"
                                    isLoading={ isLoading }
                                    testId="stripe-customer-continue-as-guest-button"
                                    type="submit"
                                    variant={ ButtonVariant.Primary }
                                >
                                    <TranslatedString id={ buttonText }/>
                                </Button> }
                            </div>
                        </div>

                        {privacyPolicyUrl && (
                            <PrivacyPolicyField isExpressPrivacyPolicy={isExpressPrivacyPolicy} url={privacyPolicyUrl} />
                        )}

                        {
                            !isLoading && <p>
                                <TranslatedString id="customer.login_text"/>
                                { ' ' }
                                <a
                                    data-test="customer-continue-button"
                                    id="checkout-customer-login"
                                    onClick={ onShowLogin }
                                >
                                    <TranslatedString id="customer.login_action"/>
                                </a>
                            </p>
                        }
                        { !authentication && checkoutButtons }
                    </Fieldset>
                </div>
                { renderCheckoutThemeStylesForStripeUPE() }
            </Form>
        </>
    );
};

export default withLanguage(
    withFormik<StripeGuestFormProps, GuestFormValues>({
            mapPropsToValues: ({
                email = '',
                defaultShouldSubscribe = false,
                requiresMarketingConsent,
            }) => ({
                email,
                shouldSubscribe: requiresMarketingConsent ? false : defaultShouldSubscribe,
                privacyPolicy: false,
            }),
            handleSubmit: ( values, { setStatus }) => {
                setStatus({
                    valSuccess: true,
                    shouldSubscribe: values.shouldSubscribe,
                  });
            },
            validationSchema: ({ language, privacyPolicyUrl, isExpressPrivacyPolicy }: StripeGuestFormProps & WithLanguageProps) => {
                if (privacyPolicyUrl && !isExpressPrivacyPolicy) {
                    return getPrivacyPolicyValidationSchema({
                            isRequired: !!privacyPolicyUrl,
                            language,
                        })
                }
            },
        })(memo(StripeGuestForm))
)

