import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import GuestSignUpForm from './GuestSignUpForm';

describe('GuestSignUpForm', () => {
    const localeContext = createLocaleContext(getStoreConfig());
    const translate = localeContext.language.translate;
    const handleSignUp = jest.fn();
    const passwordRequirements = {
        minLength: 5,
        description: 'Password should be ...',
        alpha: /w/,
        numeric: /d/,
    };

    it('renders guest sign up form', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <GuestSignUpForm
                    customerCanBeCreated={true}
                    onSignUp={noop}
                    passwordRequirements={passwordRequirements}
                />
            </LocaleContext.Provider>,
        );

        expect(screen.getByText(translate('customer.create_account_text'))).toBeInTheDocument();
        expect(screen.getByText(/case sensitive/)).toBeInTheDocument();
        expect(screen.getByText(translate('customer.password_confirmation_label'))).toBeInTheDocument();
        expect(screen.getByText(translate('customer.create_account_action'))).toBeInTheDocument();
    });

    it('notifies when user clicks on "create account" button', async () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <GuestSignUpForm
                    customerCanBeCreated={true}
                    onSignUp={handleSignUp}
                    passwordRequirements={passwordRequirements}
                />
            </LocaleContext.Provider>,
        );

        await userEvent.type(screen.getByLabelText(/case sensitive/), 'password1');
        await userEvent.type(screen.getByLabelText('Confirm Password'), 'password1');
        await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

        expect(handleSignUp).toHaveBeenCalled();
    });

    it('displays error message if password is not valid', async () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <GuestSignUpForm
                    customerCanBeCreated={true}
                    onSignUp={handleSignUp}
                    passwordRequirements={passwordRequirements}
                />
            </LocaleContext.Provider>,
        );

        await userEvent.type(screen.getByLabelText(/case sensitive/), '1');
        await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

        expect(await screen.findByText(passwordRequirements.description)).toBeInTheDocument();
    });

    it('displays error message if passwords are missing', async () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <GuestSignUpForm
                    customerCanBeCreated={true}
                    onSignUp={handleSignUp}
                    passwordRequirements={passwordRequirements}
                />
            </LocaleContext.Provider>,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

        expect(await screen.findByText(passwordRequirements.description)).toBeInTheDocument();
        expect(await screen.findByText(translate('customer.password_confirmation_required_error'))).toBeInTheDocument();
    });

    it('displays error message if passwords do not match', async () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <GuestSignUpForm
                    customerCanBeCreated={true}
                    onSignUp={handleSignUp}
                    passwordRequirements={passwordRequirements}
                />
            </LocaleContext.Provider>,
        );

        await userEvent.type(screen.getByLabelText(/case sensitive/), 'password1');
        await userEvent.type(screen.getByLabelText('Confirm Password'), 'password2');
        await userEvent.click(screen.getByRole('button', { name: 'Create Account' }));

        expect(await screen.findByText(translate('customer.password_confirmation_error'))).toBeInTheDocument();
    });
});
