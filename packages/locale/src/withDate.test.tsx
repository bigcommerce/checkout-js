import { render, screen } from '@testing-library/react';
import React, { type FunctionComponent } from 'react';

import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import createLocaleContext from './createLocaleContext';
import LocaleContext, { type LocaleContextType } from './LocaleContext';
import withDate, { type WithDateProps } from './withDate';

describe('withDate()', () => {
    let contextValue: LocaleContextType;

    beforeEach(() => {
        contextValue = createLocaleContext(getStoreConfig());
    });

    it('injects date prop to inner component', () => {
        const Inner: FunctionComponent<WithDateProps> = ({ date }) => (
            <>{date && date.inputFormat}</>
        );
        const Outer = withDate(Inner);

        render(
            <LocaleContext.Provider value={contextValue}>
                <Outer />
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('dd/MM/yyyy')).toBeInTheDocument();
    });
});
