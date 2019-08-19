import { withFormik, FormikProps } from 'formik';
import React, { FunctionComponent, ReactNode } from 'react';
import { object, string } from 'yup';

import { withLanguage, TranslatedHtml, TranslatedString, WithLanguageProps } from '../locale';
import { Button, ButtonVariant } from '../ui/button';
import { BasicFormField, Fieldset, Form, Legend  } from '../ui/form';

import EmailField from './EmailField';
import SubscribeField from './SubscribeField';

export interface GuestFormProps {
    canSubscribe: boolean;
    checkoutButtons?: ReactNode;
    defaultShouldSubscribe: boolean;
    email?: string;
    isContinuingAsGuest: boolean;
    onChangeEmail(email: string): void;
    onContinueAsGuest(data: GuestFormValues): void;
    onShowLogin(): void;
}

export interface GuestFormValues {
    email: string;
    shouldSubscribe: boolean;
}

const GuestForm: FunctionComponent<GuestFormProps & WithLanguageProps & FormikProps<GuestFormValues>> = ({
    canSubscribe,
    checkoutButtons,
    isContinuingAsGuest,
    onChangeEmail,
    onShowLogin,
}) => (
    <Form
        className="checkout-form"
        testId="checkout-customer-guest"
        id="checkout-customer-guest"
    >
        <Fieldset legend={
            <Legend hidden>
                <TranslatedString id="customer.guest_customer_text" />
            </Legend>
        }>
            <p>
                <TranslatedHtml id="customer.checkout_as_guest_text" />
            </p>

            <div className="customerEmail-container">
                <div className="customerEmail-body">
                    <EmailField onChange={ onChangeEmail } />

                    { canSubscribe && <BasicFormField
                        name="shouldSubscribe"
                        component={ SubscribeField }
                    /> }
                </div>

                <div className="form-actions customerEmail-action">
                    <Button
                        className="customerEmail-button"
                        testId="customer-continue-as-guest-button"
                        id="checkout-customer-continue"
                        isLoading={ isContinuingAsGuest }
                        variant={ ButtonVariant.Primary }
                        type="submit"
                    >
                        <TranslatedString id="customer.continue_as_guest_action" />
                    </Button>
                </div>
            </div>

            <p>
                <TranslatedString id="customer.login_text" />
                { ' ' }
                <a
                    data-test="customer-continue-button"
                    id="checkout-customer-login"
                    onClick={ onShowLogin }>
                    <TranslatedString id="customer.login_action" />
                </a>
            </p>

            { checkoutButtons }
        </Fieldset>
    </Form>
);

export default withLanguage(withFormik<GuestFormProps & WithLanguageProps, GuestFormValues>({
    mapPropsToValues: ({
        email = '',
        defaultShouldSubscribe = false,
    }) => ({
        email,
        shouldSubscribe: defaultShouldSubscribe,
    }),
    handleSubmit: (values, { props: { onContinueAsGuest } }) => {
        onContinueAsGuest(values);
    },
    validationSchema: ({ language }: GuestFormProps & WithLanguageProps) => {
        const email = string()
            .email(language.translate('customer.email_invalid_error'))
            .max(256)
            .required(language.translate('customer.email_required_error'));

        return object({ email });
    },
})(GuestForm));
