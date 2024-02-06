import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { create } from 'react-test-renderer';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { getInstruments, getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import { isAchInstrument } from '../../guards';

import ManageAchInstrumentsTable, {
    ManageAchInstrumentsTableProps,
} from './ManageAchInstrumentsTable';

describe('ManageAchInstrumentsTable', () => {
    let defaultProps: ManageAchInstrumentsTableProps;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        defaultProps = {
            instruments: getInstruments().filter(isAchInstrument),
            isDeletingInstrument: false,
            onDeleteInstrument: jest.fn(),
        };

        localeContext = createLocaleContext(getStoreConfig());
    });

    it('matches snapshot with rendered output', () => {
        const component = create(
            <LocaleContext.Provider value={localeContext}>
                <ManageAchInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        expect(component).toMatchSnapshot();
    });

    it('renders instrument as row in table', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageAchInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('0000')).toBeInTheDocument();
    });

    it('triggers callback when delete button is clicked', async () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageAchInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        await userEvent.click(screen.getAllByText('Delete')[0]);

        expect(defaultProps.onDeleteInstrument).toHaveBeenCalledWith(
            defaultProps.instruments[0].bigpayToken,
        );
    });

    it('renders message if there are no available instruments', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageAchInstrumentsTable {...defaultProps} instruments={[]} />
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
                <ManageAchInstrumentsTable {...defaultProps} isDeletingInstrument={true} />
            </LocaleContext.Provider>,
        );

        expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });
});
