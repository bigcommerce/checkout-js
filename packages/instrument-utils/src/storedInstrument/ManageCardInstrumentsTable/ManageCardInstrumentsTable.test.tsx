import userEvent from '@testing-library/user-event';
import React from 'react';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { getInstruments, getStoreConfig, getYear } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { isCardInstrument } from '../../guards';

import ManageCardInstrumentsTable, {
    type ManageCardInstrumentsTableProps,
} from './ManageCardInstrumentsTable';

describe('ManageCardInstrumentsTable', () => {
    let defaultProps: ManageCardInstrumentsTableProps;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        defaultProps = {
            instruments: getInstruments().filter(isCardInstrument),
            isDeletingInstrument: false,
            onDeleteInstrument: jest.fn(),
        };

        localeContext = createLocaleContext(getStoreConfig());
    });

    it('renders instrument as row in table', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageCardInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        expect(screen.getAllByText('Delete')).toHaveLength(2);
        expect(screen.getByText('American Express')).toBeInTheDocument();
        expect(screen.getByText(`02/${getYear(1)}`)).toBeInTheDocument();
    });

    it('triggers callback when delete button is clicked', async () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageCardInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        await userEvent.click(screen.getAllByText('Delete')[1]);

        expect(defaultProps.onDeleteInstrument).toHaveBeenCalledWith(
            defaultProps.instruments[1].bigpayToken,
        );
    });

    it('renders message if there are no available instruments', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageCardInstrumentsTable {...defaultProps} instruments={[]} />
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
                <ManageCardInstrumentsTable {...defaultProps} isDeletingInstrument={true} />
            </LocaleContext.Provider>,
        );

        // eslint-disable-next-line testing-library/no-node-access
        expect(document.querySelector('.loadingOverlay')).toBeInTheDocument();
    });
});
