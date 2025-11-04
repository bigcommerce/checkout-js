import { render, screen } from '@testing-library/react';
import React, { type FunctionComponent } from 'react';

import { LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { getLocaleContext } from '@bigcommerce/checkout/test-mocks';

import withDate, { type WithDateProps } from './withDate';

describe('withDate()', () => {
    let contextValue: LocaleContextType;

    beforeEach(() => {
        contextValue = getLocaleContext();
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
