import classNames from 'classnames';
import { FieldProps, FormikProps, withFormik } from 'formik';
import React, { FunctionComponent, memo, ReactNode, useCallback } from 'react';
import { object, string } from 'yup';

import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';

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
    isLoading,
    onChangeEmail,
    onShowLogin,
    privacyPolicyUrl,
    requiresMarketingConsent,
    isExpressPrivacyPolicy,
    isFloatingLabelEnabled,
}) => {
    const renderField = useCallback(
        (fieldProps: FieldProps<boolean>) => (
            <SubscribeField {...fieldProps} requiresMarketingConsent={requiresMarketingConsent} />
        ),
        [requiresMarketingConsent],
    );

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
                            className="customerEmail-button"
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
                    <p>
                        <TranslatedString id="customer.login_text" />{' '}
                        <a
                            data-test="customer-continue-button"
                            id="checkout-customer-login"
                            onClick={onShowLogin}
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
