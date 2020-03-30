import { withFormik, FormikProps } from 'formik';
import React, { memo, FunctionComponent } from 'react';
import { object, ref, string } from 'yup';

import { withLanguage, TranslatedString, WithLanguageProps } from '../locale';
import { Button, ButtonVariant } from '../ui/button';
import { Fieldset, Form, Legend } from '../ui/form';
import '../ui/Form.scss';

import SignUpPasswordField from './SignUpPasswordField';

export interface PasswordRequirements {
    minLength: number;
    alpha: RegExp;
    numeric: RegExp;
    description?: string;
}

export interface SignUpFormProps {
    isSigningUp?: boolean;
    passwordRequirements: PasswordRequirements;
    onSignUp(data: SignUpFormValues): void;
}

export interface SignUpFormValues {
    password: string;
    confirmPassword: string;
}

const GuestSignUpForm: FunctionComponent<SignUpFormProps & WithLanguageProps & FormikProps<SignUpFormValues>> = ({
    isSigningUp,
    passwordRequirements: { minLength },
}) => (
    <Form className="guest-signup form">
        <Fieldset
            legend={
                <Legend>
                    <TranslatedString id="customer.create_account_text" />
                </Legend>
            }
        >
            <SignUpPasswordField minLength={ minLength } />

            <div className="form-actions">
                <Button
                    id="createAccountButton"
                    isLoading={ isSigningUp }
                    type="submit"
                    variant={ ButtonVariant.Primary }
                >
                    <TranslatedString id="customer.create_account_action" />
                </Button>
            </div>
        </Fieldset>
    </Form>
);

export default withLanguage(withFormik<SignUpFormProps & WithLanguageProps, SignUpFormValues>({
    mapPropsToValues: () => ({
        password: '',
        confirmPassword: '',
    }),
    handleSubmit: (values, { props: { onSignUp } }) => {
        onSignUp(values);
    },
    validationSchema: ({
        language,
        passwordRequirements: { description, numeric, alpha, minLength },
    }: SignUpFormProps & WithLanguageProps) => object({
        password: string()
            .required(description || language.translate('customer.password_required_error'))
            .matches(numeric, description || language.translate('customer.password_number_required_error'))
            .matches(alpha, description || language.translate('customer.password_letter_required_error'))
            .min(minLength, description || language.translate('customer.password_under_minimum_length_error'))
            .max(100, language.translate('customer.password_over_maximum_length_error')),
        confirmPassword: string()
            .required(language.translate('customer.password_confirmation_required_error'))
            .oneOf([ref('password')], language.translate('customer.password_confirmation_error')),
    }),
})(memo(GuestSignUpForm)));
