import { FormField, RequestError } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType, TranslatedString } from '../locale';
import { Alert } from '../ui/alert';
import { DynamicFormField } from '../ui/form';

import { getCustomerAccountFormFields } from './formField.mock';
import CreateAccountForm from './CreateAccountForm';

describe('CreateAccountForm Component', () => {
    let localeContext: LocaleContextType;
    let component: ReactWrapper;
    let formFields: FormField[];

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        formFields = getCustomerAccountFormFields();
    });

    it('renders all fields based on formFields', () => {
        component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <CreateAccountForm
                        formFields={ formFields }
                        requiresMarketingConsent={ false }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find(DynamicFormField).length).toEqual(formFields.length);

        expect(component.find(DynamicFormField).at(0).prop('field')).toEqual(
            expect.objectContaining({
                id: 'field_4',
            })
        );
    });

    it('renders email in use error when present', () => {
        const onCancel = jest.fn();
        const createAccountError = {
            message: 'Email already in use: test@bigcommerce.com',
            type: 'request',
            status: 409,
        } as RequestError;

        component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <CreateAccountForm
                    createAccountError={ createAccountError }
                    formFields={ formFields }
                    onCancel={ onCancel }
                    requiresMarketingConsent={ false }
                />
            </LocaleContext.Provider>
        );

        expect(component.find(Alert).find(TranslatedString).props()).toEqual({
            data: { email: 'test@bigcommerce.com' },
            id: 'customer.email_in_use_text',
        });
    });

    it('calls onCancel', () => {
        const onCancel = jest.fn();

        component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <CreateAccountForm
                    formFields={ formFields }
                    onCancel={ onCancel }
                    requiresMarketingConsent={ false }
                />
            </LocaleContext.Provider>
        );

        component.find('[data-test="customer-cancel-button"]')
            .simulate('click');

        expect(onCancel).toHaveBeenCalled();
    });

    it('calls onSubmit when form is valid', async () => {
        const onSubmit = jest.fn();

        component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <CreateAccountForm
                    formFields={ formFields }
                    onSubmit={ onSubmit }
                    requiresMarketingConsent={ false }
                />
            </LocaleContext.Provider>
        );

        component.find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce.com', name: 'email' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(onSubmit).not.toHaveBeenCalled();

        component.find('input[name="password"]')
            .simulate('change', { target: { value: 'Password1235+', name: 'password' } });

        component.find('input[name="firstName"]')
            .simulate('change', { target: { value: 'foo', name: 'firstName' } });

        component.find('input[name="lastName"]')
            .simulate('change', { target: { value: 'bar', name: 'lastName' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
            acceptsMarketingEmails: ['0'],
            email: 'test@bigcommerce.com',
            firstName: 'foo',
            lastName: 'bar',
            password: 'Password1235+',
        }));
    });

    it('calls onSubmit when form is valid and requires consent', async () => {
        const onSubmit = jest.fn();

        component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <CreateAccountForm
                    formFields={ formFields }
                    onSubmit={ onSubmit }
                    requiresMarketingConsent={ true }
                />
            </LocaleContext.Provider>
        );

        component.find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce.com', name: 'email' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(onSubmit).not.toHaveBeenCalled();

        component.find('input[name="password"]')
            .simulate('change', { target: { value: 'Password1235+', name: 'password' } });

        component.find('input[name="firstName"]')
            .simulate('change', { target: { value: 'foo', name: 'firstName' } });

        component.find('input[name="lastName"]')
            .simulate('change', { target: { value: 'bar', name: 'lastName' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
            email: 'test@bigcommerce.com',
            firstName: 'foo',
            lastName: 'bar',
            password: 'Password1235+',
            acceptsMarketingEmails: [],
        }));
    });
});
