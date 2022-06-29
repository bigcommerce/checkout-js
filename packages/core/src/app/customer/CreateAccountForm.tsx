import { FormField } from '@bigcommerce/checkout-sdk';
import { withFormik, FormikProps } from 'formik';
import { noop } from 'lodash';
import React, { useMemo, FunctionComponent } from 'react';

import { preventDefault } from '../common/dom';
import { isRequestError } from '../common/error';
import { withLanguage, TranslatedString, WithLanguageProps } from '../locale';
import { Alert, AlertType } from '../ui/alert';
import { Button, ButtonVariant } from '../ui/button';
import { DynamicFormField, Fieldset, Form } from '../ui/form';

import getCreateCustomerValidationSchema, { CreateAccountFormValues } from './getCreateCustomerValidationSchema';
import getPasswordRequirements from './getPasswordRequirements';
import './CreateAccountForm.scss';

export interface CreateAccountFormProps {
    formFields: FormField[];
    createAccountError?: Error;
    isCreatingAccount?: boolean;
    requiresMarketingConsent: boolean;
    onCancel?(): void;
    onSubmit?(values: CreateAccountFormValues): void;
}

const CreateAccountForm: FunctionComponent<CreateAccountFormProps & WithLanguageProps & FormikProps<CreateAccountFormValues>> = ({
    formFields,
    createAccountError,
    isCreatingAccount,
    onCancel,
}) => {
    const createAccountErrorMessage = useMemo(() => {
        if (!createAccountError) {
            return;
        }

        if (isRequestError(createAccountError) && createAccountError.status === 409) {
            const splitMessage = createAccountError.message.split(':');

            if (splitMessage.length > 1) {
                return <TranslatedString
                    data={ { email:  splitMessage[1].trim() } }
                    id="customer.email_in_use_text"
                />;
            }

            return <TranslatedString id="customer.unknown_email_in_use_text" />;
        }

        return createAccountError.message;
    }, [createAccountError]);

    return (<>
        <Form
            className="checkout-form"
            id="checkout-customer-returning"
            testId="checkout-customer-returning"
        >
            <Fieldset>
                { createAccountErrorMessage && <Alert
                    type={ AlertType.Error }
                >
                    { createAccountErrorMessage }
                </Alert> }
                <div className="create-account-form">
                    { formFields.map(field => (
                        <DynamicFormField
                            autocomplete={ field.name }
                            extraClass={ `dynamic-form-field--${field.name}` }
                            field={ field }
                            key={ field.id }
                            parentFieldName={ field.custom ? 'customFields'  : undefined }
                        />
                    )) }
                </div>
            </Fieldset>

           <div className="form-actions">
                <Button
                    disabled={ isCreatingAccount }
                    id="checkout-customer-create"
                    testId="customer-continue-create"
                    type="submit"
                    variant={ ButtonVariant.Primary }
                >
                    <TranslatedString id="customer.create_account_action" />
                </Button>

                <a
                    className="button optimizedCheckout-buttonSecondary"
                    data-test="customer-cancel-button"
                    href="#"
                    id="checkout-customer-cancel"
                    onClick={ preventDefault(onCancel) }
                >
                    <TranslatedString id="common.cancel_action" />
                </a>
            </div>
        </Form>
    </>);
};

export default withLanguage(withFormik<CreateAccountFormProps & WithLanguageProps, CreateAccountFormValues>({
    handleSubmit: (values, { props: { onSubmit = noop } }) => {
        onSubmit(values);
    },
    mapPropsToValues: ({requiresMarketingConsent}) => ({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        customFields: {},
        acceptsMarketingEmails: requiresMarketingConsent ? [] : ['0'],
    }),
    validationSchema: ({
        language,
        formFields,
    }: CreateAccountFormProps & WithLanguageProps) => {
        const passwordRequirements = formFields.find(({ requirements }) => requirements)?.requirements;

        if (!passwordRequirements) {
            throw new Error('Password requirements missing');
        }

        const schema = getCreateCustomerValidationSchema({
            language,
            formFields,
            passwordRequirements: getPasswordRequirements(passwordRequirements),
        });

        return schema;
    },
})(CreateAccountForm));
