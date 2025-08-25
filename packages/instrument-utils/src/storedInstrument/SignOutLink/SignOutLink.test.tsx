import { createLanguageService } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { getPaymentMethod } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import SignOutLink from './SignOutLink';

describe('SignOutLink', () => {
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = {
            language: createLanguageService(),
        };
    });

    it('triggers callback when it is clicked', async () => {
        const handleSignOut = jest.fn();

        render(
            <LocaleContext.Provider value={localeContext}>
                <SignOutLink method={getPaymentMethod()} onSignOut={handleSignOut} />
            </LocaleContext.Provider>,
        );

        await userEvent.click(screen.getByRole('link'));

        expect(handleSignOut).toHaveBeenCalled();
    });
});
