import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType, TranslatedHtml, TranslatedString } from '../locale';
import { Alert, AlertType } from '../ui/alert';
import { Form } from '../ui/form';
import { LoadingSpinner } from '../ui/loading';
import { ModalHeader } from '../ui/modal';

import EmailField from './EmailField';
import EmailLoginForm, { EmailLoginFormProps } from './EmailLoginForm';

describe('EmailLoginForm', () => {
    let localeContext: LocaleContextType;
    let EmailLoginFormTest: FunctionComponent<EmailLoginFormProps>;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());

        EmailLoginFormTest = props => (
            <LocaleContext.Provider value={ localeContext }>
                <EmailLoginForm { ...props } />
            </LocaleContext.Provider>
        );
    });

    it('renders form', () => {
        const component = mount(<EmailLoginFormTest isOpen={ true } />);

        expect(component.find(Form).exists())
            .toEqual(true);

        expect(component.find('button[type="submit"]').text())
            .toEqual('Send');

        expect(component.find('button[type="button"]').text())
            .toEqual('Go Back');

        expect(component.find(ModalHeader).find(TranslatedString).prop('id'))
            .toEqual('login_email.header');

        expect(component.find('p').find(TranslatedString).prop('id'))
            .toEqual('login_email.text');

        expect(component.find(LoadingSpinner).prop('isLoading'))
            .toEqual(false);
    });

    it('renders form with initial values', () => {
        const component = mount(
            <EmailLoginFormTest
                email="test@bigcommerce.com"
                isOpen={ true }
            />
        );

        expect(component.find(ModalHeader).find(TranslatedString).prop('id'))
            .toEqual('login_email.header_with_email');

        expect(component.find('input[name="email"]').prop('value'))
            .toEqual('test@bigcommerce.com');

        expect(component.find('button[type="submit"]').text())
            .toEqual('Send');

        expect(component.find('button[type="button"]').text())
            .toEqual('Go Back');
    });

    it('notifies when user submits form', async () => {
        const handleSubmit = jest.fn();
        const component = mount(
            <EmailLoginFormTest
                isOpen={ true }
                onSendLoginEmail={ handleSubmit }
            />
        );

        component.find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce.com', name: 'email' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(handleSubmit)
            .toHaveBeenCalled();
    });

    it('renders "temporary disabled" if error.status === 429 (too many requests)', () => {
        const component = mount(
            <EmailLoginFormTest
                emailHasBeenRequested={ true }
                isOpen={ true }
                sentEmailError={ { status: 429 } }
            />
        );

        expect(component.find('[id="login_email.sent_text"]').exists())
            .toEqual(false);

        expect(component.find(Alert).prop('type'))
            .toEqual(AlertType.Error);

        expect(component.find(EmailField).exists())
            .toEqual(false);

        expect(component.find(Alert).find(TranslatedString).prop('id'))
            .toEqual('login_email.error_temporary_disabled');

        expect(component.find('button[type="submit"]').exists())
            .toEqual(false);

        expect(component.find(ModalHeader).find(TranslatedString).prop('id'))
            .toEqual('common.error_heading');

        expect(component.find('button[type="button"]').text())
            .toEqual('Ok');
    });

    it('renders "account not found" if error.status === 404', () => {
        const component = mount(
            <EmailLoginFormTest
                emailHasBeenRequested={ true }
                isOpen={ true }
                sentEmailError={ { status: 404 } }
            />
        );

        expect(component.find('[id="login_email.sent_text"]').exists())
            .toEqual(false);

        expect(component.find(Alert).prop('type'))
            .toEqual(AlertType.Error);

        expect(component.find(EmailField).exists())
            .toEqual(true);

        expect(component.find(Alert).find(TranslatedString).prop('id'))
            .toEqual('login_email.error_not_found');

        expect(component.find(ModalHeader).find(TranslatedString).prop('id'))
            .toEqual('common.error_heading');
    });

    it('renders "server error" if error.status === 500', () => {
        const component = mount(
            <EmailLoginFormTest
                emailHasBeenRequested={ true }
                isOpen={ true }
                sentEmailError={ { status: 500 } }
            />
        );

        expect(component.find('[id="login_email.sent_text"]').exists())
            .toEqual(false);

        expect(component.find(EmailField).exists())
            .toEqual(true);

        expect(component.find(Alert).prop('type'))
            .toEqual(AlertType.Error);

        expect(component.find(Alert).find(TranslatedString).prop('id'))
            .toEqual('login_email.error_server');

        expect(component.find(ModalHeader).find(TranslatedString).prop('id'))
            .toEqual('common.error_heading');
    });

    it('renders confirmation text if email has been requested', () => {
        const component = mount(
            <EmailLoginFormTest
                email="foo@bar.com"
                emailHasBeenRequested={ true }
                isOpen={ true }
                sentEmail={ { sent_email: 'sign_in', expiry: 890 } }
            />
        );

        expect(component.find('p').find(TranslatedHtml).props())
            .toEqual({
                id: 'login_email.sent_text',
                data: {
                    email: 'foo@bar.com',
                    minutes: 15,
                },
            });

        expect(component.find(ModalHeader).find(TranslatedString).prop('id'))
            .toEqual('login_email.sent_header');

        expect(component.find(EmailField).exists())
            .toEqual(false);

        expect(component.find('form a').at(0).text())
            .toEqual('Resend the link');

        expect(component.find('form a').at(1).text())
            .toEqual('sign in using your password');
    });

    it('renders reset email text if sent email is reset_password', () => {
        const component = mount(
            <EmailLoginFormTest
                email="foo@bar.com"
                emailHasBeenRequested={ true }
                isOpen={ true }
                sentEmail={ { sent_email: 'reset_password', expiry: 890 } }
            />
        );

        expect(component.find('p').find(TranslatedHtml).props())
            .toEqual(expect.objectContaining({
                id: 'customer.reset_password_before_login_error',
            }));

        expect(component.find(ModalHeader).find(TranslatedString).prop('id'))
            .toEqual('login_email.sent_header');

        expect(component.find(EmailField).exists())
            .toEqual(false);

        expect(component.find('button[type="submit"]').exists())
            .toEqual(false);
    });

    it('displays error message if email is invalid', async () => {
        const component = mount(
            <EmailLoginFormTest isOpen={ true } />
        );

        component.find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce.', name: 'email' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        component.update();

        expect(component.find('[data-test="email-field-error-message"]').text())
            .toEqual('Email address must be valid');
    });
});
