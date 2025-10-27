import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import React, { type FunctionComponent } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/contexts';

import getLanguageService from './getLanguageService';
import withLanguage, { type WithLanguageProps } from './withLanguage';

describe('withDate()', () => {
    it('injects language prop to inner component', () => {
        const Inner: FunctionComponent<WithLanguageProps> = ({ language }) => (
            <>{language && language.translate('billing.billing_heading')}</>
        );
        const Outer = withLanguage(Inner);

        render(
            <LocaleProvider
                checkoutService={createCheckoutService()}
                languageService={getLanguageService()}
            >
                <Outer />
            </LocaleProvider>,
        );

        expect(screen.getByText('Billing')).toBeInTheDocument();
    });
});
