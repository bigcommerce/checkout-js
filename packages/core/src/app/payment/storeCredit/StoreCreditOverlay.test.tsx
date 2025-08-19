import { type LanguageService } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../../config/config.mock';

import StoreCreditOverlay from './StoreCreditOverlay';

describe('StoreCreditOverlay', () => {
    let localeContext: LocaleContextType;
    let languageService: LanguageService;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        languageService = localeContext.language;
    });

    it('displays "payment is not required" text', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <StoreCreditOverlay />
            </LocaleContext.Provider>,
        );

        expect(screen.getByText(languageService.translate('payment.payment_not_required_text'))).toBeInTheDocument();
    });

    it('renders component with expected class', () => {
        const { container } = render(<StoreCreditOverlay />);

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.storeCreditOverlay')).toBeInTheDocument();
    });
});
