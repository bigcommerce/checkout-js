import React from 'react';
import { create } from 'react-test-renderer';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { getInstruments, getStoreConfig } from '@bigcommerce/checkout/test-utils';

import { isBraintreeAchInstrument } from '../../guards';

import ManageBraintreeInstrumentsTable, {
    ManageBraintreeInstrumentsTableProps,
} from './ManageBraintreeInstrumentsTable';

describe('ManageBraintreeInstrumentsTable', () => {
    let defaultProps: ManageBraintreeInstrumentsTableProps;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        defaultProps = {
            instruments: getInstruments().filter(isBraintreeAchInstrument),
            isDeletingInstrument: false,
            onDeleteInstrument: jest.fn(),
        };

        localeContext = createLocaleContext(getStoreConfig());
    });

    it('matches snapshot with rendered output', () => {
        const component = create(
            <LocaleContext.Provider value={localeContext}>
                <ManageBraintreeInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        expect(component).toMatchSnapshot();
    });

    it('renders instrument as row in table', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageBraintreeInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('0000')).toBeInTheDocument();
    });

    it('triggers callback when delete button is clicked', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageBraintreeInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        fireEvent.click(screen.getByText('Delete'));

        expect(defaultProps.onDeleteInstrument).toHaveBeenCalledWith(
            defaultProps.instruments[0].bigpayToken,
        );
    });

    it('renders message if there are no available instruments', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageBraintreeInstrumentsTable {...defaultProps} instruments={[]} />
            </LocaleContext.Provider>,
        );

        expect(
            screen.getByText(
                localeContext.language.translate('payment.instrument_manage_modal_empty_text'),
            ),
        ).toBeInTheDocument();
    });

    it('shows loading overlay when deleting', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageBraintreeInstrumentsTable {...defaultProps} isDeletingInstrument={true} />
            </LocaleContext.Provider>,
        );

        expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });
});
