import { render, screen } from '@testing-library/react';
import React, { type ReactNode } from 'react';

import { LocaleContext } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../../config/config.mock';

import { RateLimitedPermalinkView } from './RateLimitedPermalinkView';

const localeContext = createLocaleContext(getStoreConfig());

const Wrapper = ({ children }: { children: ReactNode }) => (
    <LocaleContext.Provider value={localeContext}>
        {children}
    </LocaleContext.Provider>
);

describe('RateLimitedPermalinkView', () => {
    it('renders rate limited heading', () => {
        render(<RateLimitedPermalinkView />, { wrapper: Wrapper });

        expect(
            screen.getByText(localeContext.language.translate('order_confirmation.rate_limited.heading')),
        ).toBeInTheDocument();
    });

    it('renders rate limited error message', () => {
        render(<RateLimitedPermalinkView />, { wrapper: Wrapper });

        expect(
            screen.getByText(localeContext.language.translate('order_confirmation.rate_limited.message')),
        ).toBeInTheDocument();
    });
});
