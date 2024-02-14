import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { getInstruments, getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import { isAccountInstrument, isAchInstrument, isSepaInstrument } from '../../guards';

import ManageCardInstrumentsTable, {
    ManageAccountInstrumentsTableProps,
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
        expect(screen.getByText('test@external-id.com')).toBeInTheDocument();
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
        expect(
            screen.getByText(
                localeContext.language.translate('payment.instrument_manage_modal_empty_text'),
            ),
        ).toBeInTheDocument();
    });

    it('renders Bank Account as row in table', () => {
        defaultProps = {
            instruments: [
                {
                    bigpayToken: '45454545',
                    provider: 'adyen',
                    accountNumber: 'GHI',
                    issuer: 'JKL',
                    trustedShippingAddress: false,
                    defaultInstrument: false,
                    method: 'ideal',
                    type: 'bank',
                    iban: '12345',
                },
            ],
            isDeletingInstrument: false,
            onDeleteInstrument: jest.fn(),
        };

        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageCardInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('Ending in GHI')).toBeInTheDocument();
    });

    it('renders SEPA as row in table', () => {
        defaultProps = {
            instruments: getInstruments().filter(isSepaInstrument),
            isDeletingInstrument: false,
            onDeleteInstrument: jest.fn(),
        };

        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageCardInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('Account Number (IBAN) DE133123xx111')).toBeInTheDocument();
    });

    it('renders ACH as row in table', () => {
        defaultProps = {
            instruments: getInstruments().filter(isAchInstrument),
            isDeletingInstrument: false,
            onDeleteInstrument: jest.fn(),
        };

        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageCardInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        expect(screen.getByText('Ending in 0000')).toBeInTheDocument();
        expect(screen.getByText('Ending in 0001')).toBeInTheDocument();
    });

    it('shows loading overlay when deleting', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <ManageCardInstrumentsTable {...defaultProps} isDeletingInstrument={true} />
            </LocaleContext.Provider>,
        );

        expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });
});
