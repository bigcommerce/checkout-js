import { SignInEmail } from '@bigcommerce/checkout-sdk';
import { FormikProps, withFormik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent, memo, useMemo } from 'react';

import {
    TranslatedHtml,
    TranslatedLink,
    TranslatedString,
    withLanguage,
    WithLanguageProps,
} from '@bigcommerce/checkout/locale';

import { Alert, AlertType } from '../ui/alert';
import { Button, ButtonVariant } from '../ui/button';
import { Form } from '../ui/form';
import { LoadingSpinner } from '../ui/loading';
import { Modal, ModalHeader } from '../ui/modal';

import EmailField from './EmailField';
import getEmailValidationSchema from './getEmailValidationSchema';

export interface EmailLoginFormProps {
    email?: string;
    isOpen: boolean;
    isSendingEmail?: boolean;
    emailHasBeenRequested?: boolean;
    sentEmail?: SignInEmail;
    sentEmailError?: any;
    isFloatingLabelEnabled?: boolean;
    onRequestClose?(): void;
    onSendLoginEmail?(values: EmailLoginFormValues): void;
}

export interface EmailLoginFormValues {
    email: string;
}

const EmailLoginForm: FunctionComponent<
    EmailLoginFormProps & WithLanguageProps & FormikProps<EmailLoginFormValues>
> = ({
    email,
    isOpen,
    isSendingEmail = false,
    emailHasBeenRequested,
    onRequestClose = noop,
    sentEmailError,
    sentEmail,
    submitForm,
    isFloatingLabelEnabled,
    values: { email: formEmail },
}) => {
    const modalHeaderStringId = useMemo(() => {
        if (emailHasBeenRequested) {
            if (sentEmailError) {
                return 'common.error_heading';
            }

            return 'login_email.sent_header';
        }

        if (email) {
            return 'login_email.header_with_email';
        }

        return 'login_email.header';
    }, [emailHasBeenRequested, sentEmailError, email]);

    const okButton = useMemo(
        () => (
            <div className="modal-footer">
                <Button onClick={onRequestClose}>
                    <TranslatedString id="common.ok_action" />
                </Button>
            </div>
        ),
        [onRequestClose],
    );

    const footer = useMemo(() => {
        if (sentEmailError && sentEmailError.status === 429) {
            return okButton;
        }

        if (emailHasBeenRequested && !sentEmailError) {
            if (isSendingEmail) {
                return <LoadingSpinner isLoading />;
            }

            if (sentEmail && sentEmail.sent_email === 'reset_password') {
                return okButton;
            }

            return (
                <p>
                    <TranslatedLink id="login_email.resend_link" onClick={submitForm} />
                    <TranslatedLink id="login_email.use_password_link" onClick={onRequestClose} />
                </p>
            );
        }

        return (
            <div className="modal-footer">
                <Button
                    className="optimizedCheckout-buttonSecondary"
                    onClick={onRequestClose}
                    type="button"
                >
                    <TranslatedString id="common.cancel_action" />
                </Button>
                <Button isLoading={isSendingEmail} type="submit" variant={ButtonVariant.Primary}>
                    <TranslatedString id="login_email.send" />
                </Button>
            </div>
        );
    }, [
        sentEmailError,
        emailHasBeenRequested,
        okButton,
        submitForm,
        isSendingEmail,
        onRequestClose,
        sentEmail,
    ]);

    const error = useMemo(() => {
        if (!sentEmailError) {
            return null;
        }

        const { status } = sentEmailError;

        return (
            <Alert type={AlertType.Error}>
                {status === 429 ? (
                    <TranslatedString id="login_email.error_temporary_disabled" />
                ) : (
                    <TranslatedString
                        id={
                            status === 404
                                ? 'login_email.error_not_found'
                                : 'login_email.error_server'
                        }
                    />
                )}
            </Alert>
        );
    }, [sentEmailError]);

    const form = useMemo(() => {
        if (sentEmailError && sentEmailError.status === 429) {
            return null;
        }

        if (emailHasBeenRequested && sentEmail && !sentEmailError) {
            const { expiry, sent_email } = sentEmail;

            return (
                <p>
                    <TranslatedHtml
                        data={{
                            minutes: Math.round(expiry / 60),
                        }}
                        id={
                            sent_email === 'sign_in'
                                ? 'login_email.sent_text'
                                : 'customer.reset_password_before_login_error'
                        }
                    />
                </p>
            );
        }

        if (emailHasBeenRequested && !sentEmail) {
            return <EmailField isFloatingLabelEnabled={isFloatingLabelEnabled} />;
        }

        return (
            <>
                <p>
                    <TranslatedString id="login_email.text" />
                </p>
                <EmailField isFloatingLabelEnabled={isFloatingLabelEnabled} />
            </>
        );
    }, [sentEmailError, emailHasBeenRequested, sentEmail, formEmail]);

    return (
        <Modal
            additionalBodyClassName="modal--withText"
            additionalModalClassName="modal--medium"
            header={
                <ModalHeader>
                    <TranslatedString id={modalHeaderStringId} />
                </ModalHeader>
            }
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            shouldShowCloseButton={true}
        >
            <Form>
                <LoadingSpinner isLoading={isSendingEmail && !email} />
                {error}
                {form}
                {footer}
            </Form>
        </Modal>
    );
};

export default withLanguage(
    withFormik<EmailLoginFormProps & WithLanguageProps, EmailLoginFormValues>({
        mapPropsToValues: ({ email = '' }) => ({
            email,
        }),
        handleSubmit: (values, { props: { onSendLoginEmail = noop } }) => {
            onSendLoginEmail(values);
        },
        validationSchema: ({ language }: WithLanguageProps) =>
            getEmailValidationSchema({ language }),
    })(memo(EmailLoginForm)),
);
