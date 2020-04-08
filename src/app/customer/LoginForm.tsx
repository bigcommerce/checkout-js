import { withFormik, FormikProps } from 'formik';
import React, { memo, FunctionComponent } from 'react';
import { object, string } from 'yup';

import { preventDefault } from '../common/dom';
import { withLanguage, TranslatedHtml, TranslatedString, WithLanguageProps } from '../locale';
import { Alert, AlertType } from '../ui/alert';
import { Button, ButtonVariant } from '../ui/button';
import { Fieldset, Form, Legend } from '../ui/form';

import mapErrorMessage from './mapErrorMessage';
import { EMAIL_REGEXP } from './validationPatterns';
import CustomerViewType from './CustomerViewType';
import EmailField from './EmailField';
import PasswordField from './PasswordField';

export interface LoginFormProps {
    canCancel?: boolean;
    createAccountUrl: string;
    email?: string;
    forgotPasswordUrl: string;
    isSigningIn?: boolean;
    signInError?: Error;
    viewType?: Omit<CustomerViewType, 'guest'>;
    onCancel?(): void;
    onChangeEmail?(email: string): void;
    onSignIn(data: LoginFormValues): void;
    onContinueAsGuest?(): void;
}

export interface LoginFormValues {
    email: string;
    password: string;
}

const LoginForm: FunctionComponent<LoginFormProps & WithLanguageProps & FormikProps<LoginFormValues>> = ({
    canCancel,
    createAccountUrl,
    forgotPasswordUrl,
    email,
    isSigningIn,
    language,
    onCancel,
    onChangeEmail,
    onContinueAsGuest,
    signInError,
    viewType = CustomerViewType.Login,
}) => (
    <Form
        className="checkout-form"
        id="checkout-customer-returning"
        testId="checkout-customer-returning"
    >
        <Fieldset legend={
            <Legend hidden>
                <TranslatedString id="customer.returning_customer_text" />
            </Legend>
        }
        >
            { signInError && <Alert
                testId="customer-login-error-message"
                type={ AlertType.Error }
            >
                { mapErrorMessage(signInError, key => language.translate(key)) }
            </Alert> }

            { viewType === CustomerViewType.SuggestedLogin &&
                <Alert type={ AlertType.Info }>
                    <TranslatedHtml
                        data={ { email } }
                        id="customer.guest_could_login"
                    />
                </Alert> }

            { viewType === CustomerViewType.Login && <p>
                <TranslatedHtml
                    data={ { url: createAccountUrl } }
                    id="customer.create_account_to_continue_text"
                />
            </p> }

            { viewType === CustomerViewType.CancellableEnforcedLogin &&
                <Alert type={ AlertType.Info }>
                    <TranslatedHtml
                        data={ { email } }
                        id="customer.guest_must_login"
                    />
                </Alert> }

            { viewType === CustomerViewType.EnforcedLogin &&
                <Alert type={ AlertType.Error }>
                    <TranslatedHtml
                        data={ { url: createAccountUrl } }
                        id="customer.guest_temporary_disabled"
                    />
                </Alert> }

            { (viewType === CustomerViewType.Login || viewType === CustomerViewType.EnforcedLogin) &&
                <EmailField onChange={ onChangeEmail } /> }

            <PasswordField forgotPasswordUrl={ forgotPasswordUrl } />

            <div className="form-actions">
                <Button
                    id="checkout-customer-continue"
                    isLoading={ isSigningIn }
                    testId="customer-continue-button"
                    type="submit"
                    variant={ ButtonVariant.Primary }
                >
                    <TranslatedString id="customer.sign_in_action" />
                </Button>

                { viewType === CustomerViewType.SuggestedLogin && <a
                    className="button optimizedCheckout-buttonSecondary"
                    data-test="customer-guest-continue"
                    href="#"
                    id="checkout-guest-continue"
                    onClick={ preventDefault(onContinueAsGuest) }
                >
                    <TranslatedString id="customer.continue_as_guest_action" />
                </a> }

                { canCancel &&
                    viewType !== CustomerViewType.EnforcedLogin &&
                    viewType !== CustomerViewType.SuggestedLogin  &&
                    <a
                        className="button optimizedCheckout-buttonSecondary"
                        data-test="customer-cancel-button"
                        href="#"
                        id="checkout-customer-cancel"
                        onClick={ preventDefault(onCancel) }
                    >
                        <TranslatedString id="common.cancel_action" />
                    </a> }
            </div>
        </Fieldset>
    </Form>
);

export default withLanguage(withFormik<LoginFormProps & WithLanguageProps, LoginFormValues>({
    mapPropsToValues: ({
        email = '',
    }) => ({
        email,
        password: '',
    }),
    handleSubmit: (values, { props: { onSignIn } }) => {
        onSignIn(values);
    },
    validationSchema: ({ language }: LoginFormProps & WithLanguageProps) =>
        object({
            email: string()
                .max(256)
                .matches(EMAIL_REGEXP, language.translate('customer.email_invalid_error'))
                .required(language.translate('customer.email_required_error')),
            password: string()
                .required(language.translate('customer.password_required_error')),
        }),
})(memo(LoginForm)));
