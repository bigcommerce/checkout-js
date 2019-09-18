import { mount, render } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';

import LoginForm from './LoginForm';

describe('LoginForm', () => {
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('matches snapshot', () => {
        const component = render(
            <LocaleContext.Provider value={ localeContext }>
                <LoginForm
                    createAccountUrl={ '/create-account' }
                    forgotPasswordUrl={ '/forgot-password' }
                    onSignIn={ noop }
                />
            </LocaleContext.Provider>
        );

        expect(component)
            .toMatchSnapshot();
    });

    it('renders form with initial values', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <LoginForm
                    createAccountUrl={ '/create-account' }
                    email={ 'test@bigcommerce.com' }
                    forgotPasswordUrl={ '/forgot-password' }
                    onSignIn={ noop }
                />
            </LocaleContext.Provider>
        );

        expect(component.find('input[name="email"]').prop('value'))
            .toEqual('test@bigcommerce.com');
    });

    it('notifies when user clicks on "sign in" button', async () => {
        const handleSignIn = jest.fn();
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <LoginForm
                    createAccountUrl={ '/create-account' }
                    forgotPasswordUrl={ '/forgot-password' }
                    onSignIn={ handleSignIn }
                />
            </LocaleContext.Provider>
        );

        component.find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce.com', name: 'email' } });

        component.find('input[name="password"]')
            .simulate('change', { target: { value: 'password1', name: 'password' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(handleSignIn)
            .toHaveBeenCalled();
    });

    it('displays error message if email is not valid', async () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <LoginForm
                    createAccountUrl={ '/create-account' }
                    forgotPasswordUrl={ '/forgot-password' }
                    onSignIn={ noop }
                />
            </LocaleContext.Provider>
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

    it('displays error message if password is missing', async () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <LoginForm
                    createAccountUrl={ '/create-account' }
                    forgotPasswordUrl={ '/forgot-password' }
                    onSignIn={ noop }
                />
            </LocaleContext.Provider>
        );

        component.find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce.com', name: 'email' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        component.update();

        expect(component.find('[data-test="password-field-error-message"]').text())
            .toEqual('Password is required');
    });

    it('renders error as alert if password is incorrect', () => {
        const error = Object.assign(new Error(), { body: { type: 'invalid login' } });
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <LoginForm
                    canCancel
                    createAccountUrl={ '/create-account' }
                    forgotPasswordUrl={ '/forgot-password' }
                    onSignIn={ noop }
                    signInError={ error }
                />
            </LocaleContext.Provider>
        );

        expect(component.find('[data-test="customer-login-error-message"]').text())
            .toEqual('The email or password you entered is not valid.');
    });

    it('renders cancel button if able to cancel', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <LoginForm
                    canCancel
                    createAccountUrl={ '/create-account' }
                    forgotPasswordUrl={ '/forgot-password' }
                    onSignIn={ noop }
                />
            </LocaleContext.Provider>
        );

        expect(component.exists('[data-test="customer-cancel-button"]'))
            .toEqual(true);
    });

    it('does not render cancel button by default', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <LoginForm
                    createAccountUrl={ '/create-account' }
                    forgotPasswordUrl={ '/forgot-password' }
                    onSignIn={ noop }
                />
            </LocaleContext.Provider>
        );

        expect(component.exists('[data-test="customer-cancel-button"]'))
            .toEqual(false);
    });

    it('notifies when user changes email address', () => {
        const handleChangeEmail = jest.fn();
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <LoginForm
                    createAccountUrl={ '/create-account' }
                    forgotPasswordUrl={ '/forgot-password' }
                    onChangeEmail={ handleChangeEmail }
                    onSignIn={ noop }
                />
            </LocaleContext.Provider>
        );

        component.find('input[name="email"]')
            .simulate('change', { target: { value: 'test@bigcommerce.com', name: 'email' } });

        expect(handleChangeEmail)
            .toHaveBeenCalledWith('test@bigcommerce.com');
    });
});
