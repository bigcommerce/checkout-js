import userEvent from '@testing-library/user-event';
import React from 'react';

import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../../config/config.mock';

import { getInstruments } from './instruments.mock';
import isAccountInstrument from './isAccountInstrument';
import ManageCardInstrumentsTable, {
    type ManageAccountInstrumentsTableProps,
} from './ManageAccountInstrumentsTable';

describe('ManageAccountInstrumentsTable', () => {
    let defaultProps: ManageAccountInstrumentsTableProps;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        defaultProps = {
            instruments: getInstruments().filter(isAccountInstrument),
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

        expect(
            screen.getAllByTestId('manage-instrument-accountExternalId')[0]
        ).toHaveTextContent('test@external-id.com');
    });

    it('triggers callback when delete button is clicked', async () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageCardInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        await userEvent.click(screen.getAllByTestId('manage-instrument-delete-button')[1]);

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

        expect(screen.getByText(localeContext.language.translate('payment.instrument_manage_modal_empty_text'))).toBeInTheDocument();
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
