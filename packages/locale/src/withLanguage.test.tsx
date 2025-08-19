import { render, screen } from '@testing-library/react';
import React, { type FunctionComponent } from 'react';

import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import createLocaleContext from './createLocaleContext';
import LocaleContext, { type LocaleContextType } from './LocaleContext';
import withLanguage, { type WithLanguageProps } from './withLanguage';

describe('withDate()', () => {
    let contextValue: LocaleContextType;

    beforeEach(() => {
        contextValue = createLocaleContext(getStoreConfig());
    });

    it('injects language prop to inner component', () => {
        const Inner: FunctionComponent<WithLanguageProps> = ({ language }) => (
            <>{language && language.translate('billing.billing_heading')}</>
        );
        const Outer = withLanguage(Inner);

        render(
            <LocaleContext.Provider value={contextValue}>
                <Outer />
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('Billing')).toBeInTheDocument();
    });
});
