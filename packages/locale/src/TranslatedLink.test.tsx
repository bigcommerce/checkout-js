import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import React from 'react';

import LocaleContext from './LocaleContext';
import { getLocaleContext } from './localeContext.mock';
import TranslatedLink from './TranslatedLink';

describe('TranslatedLink', () => {
    const localeContext = getLocaleContext();

    jest.spyOn(localeContext.language, 'translate');

    it('renders translated link', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <TranslatedLink
                    data={{ email: 'foo@bar' }}
                    id="customer.guest_could_login_change_email"
                    onClick={() => noop}
                />
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('Change email')).toBeInTheDocument();
        expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('renders translated text if theres no link', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <TranslatedLink
                    data={{ email: 'foo@bar' }}
                    id="customer.create_account_action"
                    onClick={() => noop}
                />
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('Create Account')).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('calls onClick when link is clicked', async () => {
        const onClick = jest.fn();

        render(
            <LocaleContext.Provider value={localeContext}>
                <TranslatedLink
                    id="customer.guest_could_login_change_email"
                    onClick={onClick}
                    testId="link"
                />
            </LocaleContext.Provider>,
        );

        await userEvent.click(screen.getByRole('link'));

        expect(onClick).toHaveBeenCalled();
    });
});
