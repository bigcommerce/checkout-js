import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../../config/config.mock';

import AccountInstrumentFieldset, {
    type AccountInstrumentFieldsetProps,
    type AccountInstrumentFieldsetValues,
} from './AccountInstrumentFieldset';
import { getInstruments } from './instruments.mock';
import isAccountInstrument from './isAccountInstrument';

describe('AccountInstrumentFieldset', () => {
    let defaultProps: AccountInstrumentFieldsetProps;
    let localeContext: LocaleContextType;
    let initialValues: AccountInstrumentFieldsetValues;

    beforeEach(() => {
        const instruments = getInstruments().filter(isAccountInstrument);

        defaultProps = {
            instruments,
            onSelectInstrument: jest.fn(),
            onUseNewInstrument: jest.fn(),
            selectedInstrument: instruments[0],
        };

        initialValues = {
            instrumentId: '',
        };

        localeContext = createLocaleContext(getStoreConfig());
    });

    it('shows instrument dropdown', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <AccountInstrumentFieldset {...defaultProps} />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('Stored accounts')).toBeInTheDocument();
        expect(screen.getByText('Manage')).toBeInTheDocument();
        expect(screen.getByText('test@external-id.com')).toBeInTheDocument();
    });

    it('shows the new address message when the list of instruments is empty', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <AccountInstrumentFieldset {...defaultProps} instruments={[]} />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('Use a different account')).toBeInTheDocument();
        expect(screen.getByText('We noticed this is a new shipping address.')).toBeInTheDocument();
    });
});
