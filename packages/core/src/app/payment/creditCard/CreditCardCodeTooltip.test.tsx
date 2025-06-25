import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../../config/config.mock';

import CreditCardCodeTooltip from './CreditCardCodeTooltip';

describe('CreditCardCodeTooltip', () => {
    it('renders the tooltip with CVV help text and card icons', () => {
        const localeContext = createLocaleContext(getStoreConfig());

        render(
            <LocaleContext.Provider value={localeContext}>
                <CreditCardCodeTooltip />
            </LocaleContext.Provider>
        );

        expect(screen.getByText('CVV visa, mc, disc')).toBeInTheDocument();
        expect(screen.getAllByRole('figure')).toHaveLength(2);
    });
});
