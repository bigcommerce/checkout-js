import { SignInEmail } from '@bigcommerce/checkout-sdk';
import { withFormik, FormikProps } from 'formik';
import { noop } from 'lodash';
import React, { memo, useMemo, FunctionComponent } from 'react';

import { withLanguage, TranslatedString, WithLanguageProps } from '../locale';
import { Alert, AlertType } from '../ui/alert';
import { Button, ButtonVariant } from '../ui/button';
import { Form } from '../ui/form';
import { LoadingSpinner } from '../ui/loading';
import { Modal, ModalHeader } from '../ui/modal';

import getEmailValidationSchema from './getEmailValidationSchema';
import EmailField from './EmailField';

export interface EmailLoginFormProps {
    email?: string;
    isOpen: boolean;
    isSendingEmail?: boolean;
    emailHasBeenRequested?: boolean;
    sentEmail?: SignInEmail;
    sentEmailError?: any;
    onRequestClose?(): void;
    onSendLoginEmail?(values: EmailLoginFormValues): void;
}

export interface EmailLoginFormValues {
    email: string;
}

const EmailLoginForm: FunctionComponent<EmailLoginFormProps & WithLanguageProps & FormikProps<EmailLoginFormValues>> = ({
    email,
    isOpen,
    isSendingEmail = false,
    emailHasBeenRequested,
    onRequestClose,
    sentEmailError,
    sentEmail,
    values: {
        email: formEmail,
    },
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

    const footer = useMemo(() => (
        <div className="modal-footer">
            { sentEmailError && sentEmailError.status === 429 ?
                <Button
                    onClick={ onRequestClose }
                    type="button"
                    variant={ ButtonVariant.Primary }
                >
                    <TranslatedString id="common.ok_action" />
                </Button> :
                <>
                    <Button
                        className="optimizedCheckout-buttonSecondary"
                        onClick={ onRequestClose }
                        type="button"
                    >
                        <TranslatedString id="common.cancel_action" />
                    </Button>
                    <Button
                        isLoading={ isSendingEmail }
                        type="submit"
                        variant={ ButtonVariant.Primary }
                    >
                        <TranslatedString id={ emailHasBeenRequested ? 'login_email.resend' : 'login_email.send' } />
                    </Button>
                </> }
        </div>
    ), [sentEmailError, emailHasBeenRequested, isSendingEmail, onRequestClose]);

    const error = useMemo(() => {
        if (!sentEmailError) {
            return null;
        }

        const { status } = sentEmailError;

        return (
            <Alert type={ AlertType.Error }>
                { status === 429 ?
                    <TranslatedString id="login_email.error_temporary_disabled" /> :
                    <TranslatedString id={ status === 404 ?
                        'login_email.error_not_found' :
                        'login_email.error_server' }
                    /> }
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
                    <TranslatedString
                        data={ {
                            email: formEmail,
                            minutes: Math.round(expiry / 60),
                        } }
                        id={ sent_email === 'sign_in' ?
                            'login_email.sent_text' :
                            'customer.reset_password_before_login_error' }
                    />
                </p>
            );
        }

        if (emailHasBeenRequested && !sentEmail) {
            return <EmailField />;
        }

        return (<>
            <p>
                <TranslatedString id="login_email.text" />
            </p>
            <EmailField />
        </>);
    }, [sentEmailError, emailHasBeenRequested, sentEmail, formEmail]);

    return (
        <Modal
            additionalBodyClassName="modal--withText"
            additionalModalClassName="modal--medium"
            header={
                <ModalHeader>
                    <TranslatedString id={ modalHeaderStringId } />
                </ModalHeader>
            }
            isOpen={ isOpen }
            onRequestClose={ onRequestClose }
            shouldShowCloseButton={ true }
        >
            <Form>
                <LoadingSpinner isLoading={ isSendingEmail && !email } />
                { error }
                { form }
                { footer }
            </Form>
        </Modal>);
};

export default withLanguage(withFormik<EmailLoginFormProps & WithLanguageProps, EmailLoginFormValues>({
    mapPropsToValues: ({
        email = '',
    }) => ({
        email,
    }),
    handleSubmit: (values, { props: { onSendLoginEmail = noop } }) => {
        onSendLoginEmail(values);
    },
    validationSchema: ({ language }: WithLanguageProps) => getEmailValidationSchema({ language }),
})(memo(EmailLoginForm)));
