import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import React from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/contexts';

import TranslatedLink from './TranslatedLink';

import { getLanguageService } from './index';

describe('TranslatedLink', () => {
    const checkoutService = createCheckoutService();
    const languageService = getLanguageService();

    jest.spyOn(languageService, 'translate');

    it('renders translated link', () => {
        render(
            <LocaleProvider checkoutService={checkoutService} languageService={languageService}>
                <TranslatedLink
                    data={{ email: 'foo@bar' }}
                    id="customer.guest_could_login_change_email"
                    onClick={() => noop}
                />
            </LocaleProvider>,
        );

        expect(screen.getByText('Change email')).toBeInTheDocument();
        expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('renders translated text if theres no link', () => {
        render(
            <LocaleProvider checkoutService={checkoutService} languageService={languageService}>
                <TranslatedLink
                    data={{ email: 'foo@bar' }}
                    id="customer.create_account_action"
                    onClick={() => noop}
                />
            </LocaleProvider>,
        );

        expect(screen.getByText('Create Account')).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('calls onClick when link is clicked', async () => {
        const onClick = jest.fn();

        render(
            <LocaleProvider checkoutService={checkoutService} languageService={languageService}>
                <TranslatedLink
                    id="customer.guest_could_login_change_email"
                    onClick={onClick}
                    testId="link"
                />
            </LocaleProvider>,
        );

        await userEvent.click(screen.getByRole('link'));

        expect(onClick).toHaveBeenCalled();
    });
});
