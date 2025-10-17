/* istanbul ignore file */

// TODO: CHECKOUT-9010 Cover 'Customer registration failure due to using an existing email' in functional tests repo
import { type FormField } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { type FormikProps, withFormik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent, useMemo } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString, withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { DynamicFormField } from '@bigcommerce/checkout/ui';

import { isRequestError } from '../common/error';
import { Alert, AlertType } from '../ui/alert';
import { Button, ButtonVariant } from '../ui/button';
import { Fieldset, Form } from '../ui/form';

import getCreateCustomerValidationSchema, {
    type CreateAccountFormValues,
} from './getCreateCustomerValidationSchema';
import getPasswordRequirements from './getPasswordRequirements';

import './CreateAccountForm.scss';

export interface CreateAccountFormProps {
    formFields: FormField[];
    createAccountError?: Error;
    isCreatingAccount?: boolean;
    isExecutingPaymentMethodCheckout?: boolean;
    requiresMarketingConsent: boolean;
    defaultShouldSubscribe: boolean;
    isFloatingLabelEnabled?: boolean;
    onCancel?(): void;
    onSubmit(values: CreateAccountFormValues): void;
}

function getAcceptsMarketingEmailsDefault(defaultShouldSubscribe: boolean, requiresMarketingConsent: boolean): string[] {
    if (defaultShouldSubscribe) {
        return ['1'];
    }

    return requiresMarketingConsent ? [] : ['0'];
}

function transformFormFieldsData(formFields: FormField[], defaultShouldSubscribe: boolean): FormField[] {
    return formFields.map(field => {
        if (field.name === 'acceptsMarketingEmails') {
            const { options } = field;
            const items = options?.items || [];

            const updatedItems = items.map(item => {
                return {
                    value: defaultShouldSubscribe ? '1' : item.value,
                    label: item.label,
                }
            });

            return {
                ...field,
                options: {
                    items: updatedItems,
                }
            }
        }

        return field;
    });
}

const CreateAccountForm: FunctionComponent<
    CreateAccountFormProps & WithLanguageProps & FormikProps<CreateAccountFormValues>
> = ({ formFields, createAccountError, isCreatingAccount, isExecutingPaymentMethodCheckout, onCancel, isFloatingLabelEnabled, defaultShouldSubscribe }) => {
    const { themeV2 } = useThemeContext();
    const createAccountErrorMessage = useMemo(() => {
        if (!createAccountError) {
            return;
        }

        if (isRequestError(createAccountError) && createAccountError.status === 409) {
            const splitMessage = createAccountError.message.split(':');

            if (splitMessage.length > 1) {
                return (
                    <TranslatedString
                        data={{ email: splitMessage[1].trim() }}
                        id="customer.email_in_use_text"
                    />
                );
            }

            return <TranslatedString id="customer.unknown_email_in_use_text" />;
        }

        return createAccountError.message;
    }, [createAccountError]);

    const fields = transformFormFieldsData(formFields, defaultShouldSubscribe);

    return (
        <Form
            className="checkout-form"
            id="checkout-customer-returning"
            testId="checkout-customer-returning"
        >
            <Fieldset>
                {createAccountErrorMessage && (
                    <Alert type={AlertType.Error}>{createAccountErrorMessage}</Alert>
                )}
                <div className="create-account-form">
                    {fields.map((field) => (
                        <DynamicFormField
                            autocomplete={field.name}
                            extraClass={`dynamic-form-field--${field.name}`}
                            field={field}
                            isFloatingLabelEnabled={isFloatingLabelEnabled}
                            key={field.id}
                            parentFieldName={field.custom ? 'customFields' : undefined}
                            themeV2={themeV2}
                        />
                    ))}
                </div>
            </Fieldset>

            <div className="form-actions">
                <Button
                    className={themeV2 ? 'body-bold' : ''}
                    disabled={isCreatingAccount || isExecutingPaymentMethodCheckout}
                    id="checkout-customer-create"
                    isLoading={isCreatingAccount || isExecutingPaymentMethodCheckout}
                    testId="customer-continue-create"
                    type="submit"
                    variant={ButtonVariant.Primary}
                >
                    <TranslatedString id="customer.create_account_action" />
                </Button>

                <a
                    className={classNames('button optimizedCheckout-buttonSecondary',
                        { 'body-bold': themeV2 })}
                    data-test="customer-cancel-button"
                    href="#"
                    id="checkout-customer-cancel"
                    onClick={preventDefault(onCancel)}
                >
                    <TranslatedString id="common.cancel_action" />
                </a>
            </div>
        </Form>
    );
};

export default withLanguage(
    withFormik<CreateAccountFormProps & WithLanguageProps, CreateAccountFormValues>({
        handleSubmit: (values, { props: { onSubmit = noop } }) => {
            onSubmit(values);
        },
        mapPropsToValues: ({ defaultShouldSubscribe, requiresMarketingConsent }) => ({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            customFields: {},
            acceptsMarketingEmails: getAcceptsMarketingEmailsDefault(defaultShouldSubscribe, requiresMarketingConsent),
        }),
        validationSchema: ({
            language,
            formFields,
        }: CreateAccountFormProps & WithLanguageProps) => {
            const passwordRequirements = formFields.find(
                ({ requirements }) => requirements,
            )?.requirements;

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
    })(CreateAccountForm),
);
