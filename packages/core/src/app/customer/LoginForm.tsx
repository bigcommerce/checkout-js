import classNames from 'classnames';
import { type FormikProps, withFormik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent, memo, useCallback } from 'react';
import { object, string } from 'yup';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import {
    TranslatedHtml,
    TranslatedLink,
    TranslatedString,
    withLanguage,
    type WithLanguageProps,
} from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { Alert, AlertType } from '../ui/alert';
import { Button, ButtonVariant } from '../ui/button';
import { Fieldset, Form, Legend } from '../ui/form';

import CustomerViewType from './CustomerViewType';
import EmailField from './EmailField';
import getEmailValidationSchema from './getEmailValidationSchema';
import mapErrorMessage from './mapErrorMessage';
import PasswordField from './PasswordField';
import { RedirectToStorefrontLogin } from './RedirectToStorefrontLogin';

export interface LoginFormProps {
    continueAsGuestButtonLabelId: string;
    email?: string;
    isEmbedded?: boolean;
    viewType?: Omit<CustomerViewType, 'guest'>;
    isFloatingLabelEnabled?: boolean;
    signInError?: Error;
    onCancel?(): void;
    onCreateAccount?(): void;
    onChangeEmail?(email: string): void;
    onSignIn(data: LoginFormValues): void;
    onSendLoginEmail?(): void;
    onContinueAsGuest?(): void;
}

export interface LoginFormValues {
    email: string;
    password: string;
}

const LoginForm: FunctionComponent<
    LoginFormProps & FormikProps<LoginFormValues> & WithLanguageProps
> = ({
    continueAsGuestButtonLabelId,
    email,
    isEmbedded,
    language,
    signInError,
    onCancel = noop,
    onChangeEmail,
    onContinueAsGuest,
    onCreateAccount = noop,
    onSendLoginEmail = noop,
    isFloatingLabelEnabled,
    viewType = CustomerViewType.Login,
}) => {
    const { themeV2 } = useThemeContext();
    const { checkoutState } = useCheckout();

    const {
        data: { getCart, getConfig },
        statuses: { isExecutingPaymentMethodCheckout, isSigningIn },
    } = checkoutState;
    const cart = getCart();
    const config = getConfig();

    if (!cart || !config) {
        throw new Error('cart is not available');
    }

    const {
        checkoutSettings: {
            isAccountCreationEnabled: shouldShowCreateAccountLink,
            isSignInEmailEnabled,
            guestCheckoutEnabled: canCancel,
            shouldRedirectToStorefrontForAuth,
        },
        links: {
            forgotPasswordLink: forgotPasswordUrl
        }
    } = config;

    const isBuyNowCart = cart.source === 'BUY_NOW';

    const changeEmailLink = useCallback(() => {
        if (!email) {
            return null;
        }

        return (
            <p className="optimizedCheckout-contentSecondary">
                <TranslatedLink
                    data={{ email }}
                    id="customer.guest_could_login_change_email"
                    onClick={onCancel}
                    testId="change-email"
                />
            </p>
        );
    }, [email, onCancel]);

    return (
        <Form
            className="checkout-form"
            id="checkout-customer-returning"
            testId="checkout-customer-returning"
        >
            <Fieldset
                legend={
                    <Legend hidden>
                        <TranslatedString id="customer.returning_customer_text" />
                    </Legend>
                }
            >
                {signInError && (
                    <Alert testId="customer-login-error-message" type={AlertType.Error}>
                        {mapErrorMessage(signInError, (key) => language.translate(key))}
                    </Alert>
                )}

                {viewType === CustomerViewType.SuggestedLogin && (
                    <Alert type={AlertType.Info}>
                        <TranslatedHtml data={{ email }} id="customer.guest_could_login" />
                    </Alert>
                )}

                {viewType === CustomerViewType.CancellableEnforcedLogin && (
                    <Alert type={AlertType.Info}>
                        <TranslatedHtml data={{ email }} id="customer.guest_must_login" />
                    </Alert>
                )}

                {viewType === CustomerViewType.EnforcedLogin && (
                    <Alert type={AlertType.Error}>
                        <TranslatedLink
                            id="customer.guest_temporary_disabled"
                            onClick={onCreateAccount}
                        />
                    </Alert>
                )}

                {(viewType === CustomerViewType.Login ||
                    viewType === CustomerViewType.EnforcedLogin) && (
                    <EmailField isFloatingLabelEnabled={isFloatingLabelEnabled} onChange={onChangeEmail} />
                )}

                {!shouldRedirectToStorefrontForAuth && <PasswordField isFloatingLabelEnabled={isFloatingLabelEnabled} />}

                <p className={classNames('form-legend-container', { 'body-cta': themeV2 })}>
                    <span>
                        { isSignInEmailEnabled && !isEmbedded && !isBuyNowCart &&
                            <TranslatedLink
                                id="login_email.link"
                                onClick={ onSendLoginEmail }
                                testId="customer-signin-link"
                            />
                        }
                        { !isSignInEmailEnabled && !isEmbedded && !shouldRedirectToStorefrontForAuth &&
                            <a
                                data-test="forgot-password-link"
                                href={ forgotPasswordUrl }
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <TranslatedString id="customer.forgot_password_action" />
                            </a>
                        }
                    </span>
                    { viewType === CustomerViewType.Login && shouldShowCreateAccountLink &&
                        <span>
                            <TranslatedLink
                                id="customer.create_account_to_continue_text"
                                onClick={onCreateAccount}
                            />
                        </span>
                    }
                </p>

                <div className="form-actions">
                    {shouldRedirectToStorefrontForAuth ?
                        <RedirectToStorefrontLogin
                            isDisabled={Boolean(isSigningIn() || isExecutingPaymentMethodCheckout())}
                            isLoading={Boolean(isSigningIn() || isExecutingPaymentMethodCheckout())}
                        />
                        :
                        <Button
                            className={themeV2 ? 'body-bold' : ''}
                            disabled={isSigningIn() || isExecutingPaymentMethodCheckout()}
                            id="checkout-customer-continue"
                            isLoading={isSigningIn() || isExecutingPaymentMethodCheckout()}
                            testId="customer-continue-button"
                            type="submit"
                            variant={ButtonVariant.Primary}
                    >
                        <TranslatedString id="customer.sign_in_action" />
                    </Button>}

                    {viewType === CustomerViewType.SuggestedLogin && (
                        <a
                            className={classNames('button optimizedCheckout-buttonSecondary',
                                { 'body-bold': themeV2 })}
                            data-test="customer-guest-continue"
                            href="#"
                            id="checkout-guest-continue"
                            onClick={preventDefault(onContinueAsGuest)}
                        >
                            <TranslatedString id={continueAsGuestButtonLabelId} />
                        </a>
                    )}

                    {canCancel &&
                        viewType !== CustomerViewType.EnforcedLogin &&
                        viewType !== CustomerViewType.SuggestedLogin && (
                            <a
                            className={classNames('button optimizedCheckout-buttonSecondary',
                                { 'body-bold': themeV2 })}
                                data-test="customer-cancel-button"
                                href="#"
                                id="checkout-customer-cancel"
                                onClick={preventDefault(onCancel)}
                            >
                                <TranslatedString
                                    id={
                                        viewType === CustomerViewType.CancellableEnforcedLogin
                                            ? 'login_email.use_another_email'
                                            : 'common.cancel_action'
                                    }
                                />
                            </a>
                        )}
                </div>

                {viewType === CustomerViewType.SuggestedLogin && changeEmailLink()}
            </Fieldset>
        </Form>
    );
};

export default withLanguage(withFormik<LoginFormProps & WithLanguageProps, LoginFormValues>({
    mapPropsToValues: ({ email = '' }) => ({
        email,
        password: '',
    }),
    handleSubmit: (values, { props: { onSignIn } }) => {
        onSignIn(values);
    },
    validationSchema: ({ language }: LoginFormProps & WithLanguageProps) =>
        getEmailValidationSchema({ language }).concat(
            object({
                password: string().required(
                    language.translate('customer.password_required_error'),
                ),
            }),
        ),
})(memo(LoginForm)));
