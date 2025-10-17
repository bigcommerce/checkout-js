import classNames from 'classnames';
import { type FieldProps, type FormikProps, withFormik } from 'formik';
import React, { type FunctionComponent, memo, type ReactNode, useCallback, useEffect } from 'react';
import { object, string } from 'yup';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString, withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { PayPalFastlaneWatermark } from '@bigcommerce/checkout/paypal-fastlane-integration';

import { getPrivacyPolicyValidationSchema, PrivacyPolicyField } from '../privacyPolicy';
import { Button, ButtonVariant } from '../ui/button';
import { BasicFormField, Fieldset, Form, Legend } from '../ui/form';

import EmailField from './EmailField';
import SubscribeField from './SubscribeField';
import { SubscribeSessionStorage } from './SubscribeSessionStorage';

function getShouldSubscribeValue(requiresMarketingConsent: boolean, defaultShouldSubscribe: boolean) {
    if (SubscribeSessionStorage.getSubscribeStatus()) {
        return true;
    }

    return requiresMarketingConsent ? false : defaultShouldSubscribe
}

export interface GuestFormProps {
    canSubscribe: boolean;
    checkoutButtons?: ReactNode;
    continueAsGuestButtonLabelId: string;
    requiresMarketingConsent: boolean;
    defaultShouldSubscribe: boolean;
    email?: string;
    isLoading: boolean;
    privacyPolicyUrl?: string;
    isExpressPrivacyPolicy: boolean;
    isFloatingLabelEnabled?: boolean;
    shouldShowEmailWatermark: boolean;
    onChangeEmail(email: string): void;
    onContinueAsGuest(data: GuestFormValues): void;
    onShowLogin(): void;
}

export interface GuestFormValues {
    email: string;
    shouldSubscribe: boolean;
}

const GuestForm: FunctionComponent<
    GuestFormProps & WithLanguageProps & FormikProps<GuestFormValues>
> = ({
    canSubscribe,
    checkoutButtons,
    continueAsGuestButtonLabelId,
    defaultShouldSubscribe,
    isLoading,
    onChangeEmail,
    onShowLogin,
    privacyPolicyUrl,
    requiresMarketingConsent,
    isExpressPrivacyPolicy,
    isFloatingLabelEnabled,
    shouldShowEmailWatermark,
    setFieldValue,
}) => {
    const {
        checkoutState: {
            data: { getConfig }
        }
    } = useCheckout();
    const { themeV2 } = useThemeContext();

    const config = getConfig();

    const renderField = useCallback(
        (fieldProps: FieldProps<boolean>) => (
            <SubscribeField {...fieldProps} requiresMarketingConsent={requiresMarketingConsent} />
        ),
        [requiresMarketingConsent],
    );

    useEffect(() => {
        void setFieldValue(
            'shouldSubscribe',
            getShouldSubscribeValue(requiresMarketingConsent, defaultShouldSubscribe),
            );
    }, [requiresMarketingConsent, defaultShouldSubscribe]);

    if (!config) {
        return null;
    }

    const {
        checkoutSettings: {
            shouldRedirectToStorefrontForAuth,
        },
        links: {
            checkoutLink,
            loginLink,
        }
    } = config;

    const handleLogin: () => void = () => {
        if (shouldRedirectToStorefrontForAuth) {
            window.location.assign(`${loginLink}?redirectTo=${checkoutLink}`);

            return;
        }

        return onShowLogin();
    }

    return (
        <Form
            className="checkout-form"
            id="checkout-customer-guest"
            testId="checkout-customer-guest"
        >
            <Fieldset
                legend={
                    <Legend hidden>
                        <TranslatedString id="customer.guest_customer_text" />
                    </Legend>
                }
            >
                <div className="customerEmail-container">
                    <div className="customerEmail-body">
                        <EmailField isFloatingLabelEnabled={isFloatingLabelEnabled} onChange={onChangeEmail}/>

                        {shouldShowEmailWatermark && <PayPalFastlaneWatermark />}

                        {(canSubscribe || requiresMarketingConsent) && (
                            <BasicFormField name="shouldSubscribe" render={renderField} />
                        )}
                    </div>

                    <div
                        className={classNames('form-actions customerEmail-action', {
                            'customerEmail-floating--enabled': isFloatingLabelEnabled,
                        })}
                    >
                        <Button
                            className={classNames('customerEmail-button', {
                                'body-bold': themeV2,
                            })}
                            id="checkout-customer-continue"
                            isLoading={isLoading}
                            testId="customer-continue-as-guest-button"
                            type="submit"
                            variant={ButtonVariant.Primary}
                        >
                            <TranslatedString id={continueAsGuestButtonLabelId} />
                        </Button>
                    </div>
                </div>

                {privacyPolicyUrl && (
                    <PrivacyPolicyField isExpressPrivacyPolicy={isExpressPrivacyPolicy} url={privacyPolicyUrl} />
                )}

                {!isLoading && (
                    <p className={classNames('customer-login-link',
                        { 'body-regular': themeV2 })}
                    >
                        <TranslatedString id="customer.login_text" />{' '}
                        <a
                            data-test="customer-continue-button"
                            id="checkout-customer-login"
                            onClick={handleLogin}
                            role="button"
                            tabIndex={0}
                        >
                            <TranslatedString id="customer.login_action" />
                        </a>
                    </p>
                )}

                {checkoutButtons}
            </Fieldset>
        </Form>
    );
};

export default withLanguage(
    withFormik<GuestFormProps & WithLanguageProps, GuestFormValues>({
        mapPropsToValues: ({
            email = '',
            defaultShouldSubscribe = false,
            requiresMarketingConsent,
        }) => ({
            email,
            shouldSubscribe: getShouldSubscribeValue(requiresMarketingConsent, defaultShouldSubscribe),
            privacyPolicy: false,
        }),
        handleSubmit: (values, { props: { onContinueAsGuest } }) => {
            onContinueAsGuest(values);
        },
        validationSchema: ({ language, privacyPolicyUrl, isExpressPrivacyPolicy }: GuestFormProps & WithLanguageProps) => {
            const email = string()
                .email(language.translate('customer.email_invalid_error'))
                .max(256)
                .required(language.translate('customer.email_required_error'));

            const baseSchema = object({ email });

            if (privacyPolicyUrl && !isExpressPrivacyPolicy) {
                return baseSchema.concat(
                    getPrivacyPolicyValidationSchema({
                        isRequired: !!privacyPolicyUrl,
                        language,
                    }),
                );
            }

            return baseSchema;
        },
    })(memo(GuestForm)),
);
