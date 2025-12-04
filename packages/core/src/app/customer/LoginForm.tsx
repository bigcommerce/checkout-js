import classNames from 'classnames';
import { type FormikProps, withFormik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent, memo,  MouseEvent } from 'react';
import { object, string } from 'yup';

import { useCheckout, useThemeContext } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import {
    TranslatedString,
    withLanguage,
    type WithLanguageProps,
} from '@bigcommerce/checkout/locale';

import { Alert, AlertType } from '../ui/alert';
import { Button, ButtonVariant } from '../ui/button';
import { Fieldset, Form, Legend } from '../ui/form';

import CustomerViewType from './CustomerViewType';
import getEmailValidationSchema from './getEmailValidationSchema';
import mapErrorMessage from './mapErrorMessage';
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
}

const LoginForm: FunctionComponent<
    LoginFormProps & FormikProps<LoginFormValues> & WithLanguageProps
> = ({
    continueAsGuestButtonLabelId,
    language,
    signInError,
    onCancel = noop,
    onContinueAsGuest,
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
            guestCheckoutEnabled: canCancel,
            shouldRedirectToStorefrontForAuth,
        },
    } = config;

    const handleRedirect = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (window.location.hostname === 'store.iapp.com') {
            window.location.href = 'https://myiapp.org/store?redirectPage=checkout';
        } else {
            window.location.href = 'https://test.myiapp.org/store?redirectPage=checkout';
        }
    };

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

                {viewType === CustomerViewType.EnforcedLogin && (
                    <Alert type={AlertType.Error}></Alert>
                )}

                <p className={classNames('form-legend-container', { 'body-cta': themeV2 })}>
                    <span />
                    { viewType === CustomerViewType.Login && shouldShowCreateAccountLink &&
                        <span />
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
                            id="checkout-customer-continue"
                            onClick={handleRedirect}
                            testId="customer-continue-button"
                            variant={ButtonVariant.Primary}
                        >
                            <TranslatedString id="customer.sign_in_action" />
                        </Button>
                    }

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
