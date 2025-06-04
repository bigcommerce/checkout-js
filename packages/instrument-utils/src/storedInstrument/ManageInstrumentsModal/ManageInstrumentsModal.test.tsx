import {
    CardInstrument,
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    RequestError,
} from '@bigcommerce/checkout-sdk';
import { render as originalRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { CheckoutContext } from '@bigcommerce/checkout/payment-integration-api';
import { getInstruments, getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { fireEvent, render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import { isAccountInstrument, isBankAccountInstrument, isCardInstrument } from '../../guards';

import ManageInstrumentsModal, { ManageInstrumentsModalProps } from './ManageInstrumentsModal';

describe('ManageInstrumentsModal', () => {
    let ManageInstrumentsModalTest: FunctionComponent<ManageInstrumentsModalProps>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: ManageInstrumentsModalProps;
    let localeContext: LocaleContextType;
    let instruments: CardInstrument[];

    beforeEach(() => {
        instruments = getInstruments().filter(isCardInstrument);

        defaultProps = {
            isOpen: true,
            instruments,
            onAfterOpen: jest.fn(),
            onRequestClose: jest.fn(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        localeContext = createLocaleContext(getStoreConfig());

        ManageInstrumentsModalTest = (props) => (
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <LocaleContext.Provider value={localeContext}>
                    <ManageInstrumentsModal {...props} />
                </LocaleContext.Provider>
            </CheckoutContext.Provider>
        );
    });

    it('throws an error if not wrapped in checkout context', () => {
        expect(() =>
            originalRender(
                <LocaleContext.Provider value={localeContext}>
                    <ManageInstrumentsModal {...defaultProps} />
                </LocaleContext.Provider>,
            ),
        ).toThrow('Need to wrap in checkout context');
    });

    it('renders list of card instruments in table format', () => {
        render(
            <ManageInstrumentsModalTest
                {...defaultProps}
                instruments={getInstruments().filter(isCardInstrument)}
            />,
        );

        expect(screen.getByTestId('manage-card-instruments-table')).toBeInTheDocument();

        expect(screen.queryByTestId('manage-instruments-table')).not.toBeInTheDocument();
    });

    it('renders list of account instruments in table format', () => {
        render(
            <ManageInstrumentsModalTest
                {...defaultProps}
                instruments={getInstruments().filter(isAccountInstrument)}
            />,
        );

        expect(screen.getByTestId('manage-instruments-table')).toBeInTheDocument();

        expect(screen.queryByTestId('manage-card-instruments-table')).not.toBeInTheDocument();
    });

    it('renders list of bank instruments in table format', () => {
        render(
            <ManageInstrumentsModalTest
                {...defaultProps}
                instruments={getInstruments().filter(isBankAccountInstrument)}
            />,
        );

        expect(screen.getByTestId('manage-instruments-table')).toBeInTheDocument();

        expect(screen.queryByTestId('manage-card-instruments-table')).not.toBeInTheDocument();
    });

    it('shows confirmation message before deleting instrument', async () => {
        render(<ManageInstrumentsModalTest {...defaultProps} />);

        await userEvent.click(await screen.findByTestId('manage-instrument-delete-button-123'));

        expect(
            screen.getByText(
                localeContext.language.translate(
                    'payment.instrument_manage_modal_confirmation_label',
                ),
            ),
        ).toBeInTheDocument();
    });

    it('deletes selected instrument and closes modal if user confirms their action', async () => {
        jest.spyOn(checkoutService, 'deleteInstrument').mockResolvedValue(checkoutState);

        render(<ManageInstrumentsModalTest {...defaultProps} />);

        await userEvent.click(await screen.findByTestId('manage-instrument-delete-button-123'));
        await userEvent.click(await screen.findByTestId('manage-instrument-confirm-button-123'));

        expect(checkoutService.deleteInstrument).toHaveBeenCalledWith(instruments[0].bigpayToken);
        expect(defaultProps.onRequestClose).toHaveBeenCalled();
    });

    it('shows list of instruments if user decides to cancel their action', async () => {
        render(<ManageInstrumentsModalTest {...defaultProps} />);

        fireEvent.click(screen.getByTestId('manage-instrument-delete-button-123'));
        fireEvent.click(screen.getByTestId('manage-instrument-confirm-button-123'));

        await waitFor(() => {
            expect(screen.getByTestId('manage-card-instruments-table')).toBeInTheDocument();
        });
    });

    it('cancels "delete confirmation" screen when modal is re-open', () => {
        jest.spyOn(checkoutService, 'deleteInstrument').mockResolvedValue(checkoutState);

        render(<ManageInstrumentsModalTest {...defaultProps} />);

        fireEvent.click(screen.getByTestId('manage-instrument-delete-button-123'));
        fireEvent.click(screen.getByText('Cancel'));

        expect(screen.getByTestId('manage-card-instruments-table')).toBeInTheDocument();
    });

    it('displays error message to user if unable to delete instrument', () => {
        jest.spyOn(checkoutState.errors, 'getDeleteInstrumentError').mockReturnValue({
            status: 500,
        } as RequestError);

        render(<ManageInstrumentsModalTest {...defaultProps} />);

        expect(
            screen.getByText(
                localeContext.language.translate('payment.instrument_manage_delete_server_error'),
            ),
        ).toBeInTheDocument();
    });
});
