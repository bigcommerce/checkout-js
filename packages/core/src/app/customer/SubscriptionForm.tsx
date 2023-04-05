import { withFormik, FieldProps, FormikProps } from 'formik';
import React, { memo, useCallback, FunctionComponent, ReactNode } from 'react';
import { object, string } from 'yup';

import { withLanguage, TranslatedHtml, TranslatedString, WithLanguageProps } from '../locale';
import { getPrivacyPolicyValidationSchema, PrivacyPolicyField } from '../privacyPolicy';
import { Button, ButtonVariant } from '../ui/button';
import { BasicFormField, Fieldset, Form, Legend  } from '../ui/form';

import EmailField from './EmailField';
import SubscribeField from './SubscribeField';

export interface SubscriptionFormProps {
    canSubscribe: boolean;
    checkoutButtons?: ReactNode;
    continueAsGuestButtonLabelId: string;
    requiresMarketingConsent: boolean;
    defaultShouldSubscribe: boolean;
    email?: string;
    isLoading: boolean;
    privacyPolicyUrl?: string;
    onChangeEmail(email: string): void;
    onContinueAsGuest(data: GuestFormValues): void;
    onShowLogin(): void;
    onCreateAccount(): void;
}

export interface GuestFormValues {
    email: string;
    shouldSubscribe: boolean;
}

const SubscriptionForm: FunctionComponent<SubscriptionFormProps & WithLanguageProps & FormikProps<GuestFormValues>> = ({
    canSubscribe,
    checkoutButtons,
    continueAsGuestButtonLabelId,
    isLoading,
    onChangeEmail,
    onShowLogin,
    onCreateAccount,
    privacyPolicyUrl,
    requiresMarketingConsent,
}) => {

    const renderField = useCallback((fieldProps: FieldProps<boolean>) => (
        <SubscribeField
            { ...fieldProps }
            requiresMarketingConsent={ requiresMarketingConsent }
        />
    ), [
        requiresMarketingConsent,
    ]);

    return (
        <div
            className="checkout-form"
        >
            <p>
                Create an account to purchase this subscription. It&apos;s fast, easy and you&apos;ll be able to make changes to your subscription online anytime.
            </p>

            <Button
                // className="customerEmail-button"
                onClick={ onCreateAccount }
                variant={ ButtonVariant.Primary }
            >
                <TranslatedString id={ 'customer.create_account_action' } />
            </Button>
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
        </div>
    );
};

export default withLanguage(withFormik<SubscriptionFormProps & WithLanguageProps, GuestFormValues>({
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
    validationSchema: ({ language, privacyPolicyUrl }: SubscriptionFormProps & WithLanguageProps) => {
        const email = string()
            .email(language.translate('customer.email_invalid_error'))
            .max(256)
            .required(language.translate('customer.email_required_error'));

        const baseSchema = object({ email });

        if (privacyPolicyUrl) {
            return baseSchema.concat(getPrivacyPolicyValidationSchema({
                isRequired: !!privacyPolicyUrl,
                language,
            }));
        }

        return baseSchema;
    },
})(memo(SubscriptionForm)));
