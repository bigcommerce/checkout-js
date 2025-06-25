
import {
    CardInstrument,
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    RequestError,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { getYear } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../../config/config.mock';

import { getInstruments } from './instruments.mock';
import isAccountInstrument from './isAccountInstrument';
import isBankAccountInstrument from './isBankAccountInstrument';
import isCardInstrument from './isCardInstrument';
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
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ManageInstrumentsModal {...props} />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('deletes selected instrument and closes modal if user confirms their action', async () => {
        jest.spyOn(checkoutService, 'deleteInstrument').mockResolvedValue(checkoutState);

        render(<ManageInstrumentsModalTest {...defaultProps} />);

        await userEvent.click(screen.getAllByText('Delete')[0]);
        await userEvent.click(screen.getByText('Yes, delete'));

        expect(checkoutService.deleteInstrument).toHaveBeenCalledWith(instruments[0].bigpayToken);
        expect(defaultProps.onRequestClose).toHaveBeenCalled();
    });

    it('renders list of card instruments in table format', () => {
        render(
            <ManageInstrumentsModalTest
                {...defaultProps}
                instruments={getInstruments().filter(isCardInstrument)}
            />,
        );

        expect(screen.getByText('Manage stored payment methods')).toBeInTheDocument();
        expect(screen.getAllByText('Delete')).toHaveLength(2);
        expect(screen.getByText(`02/${getYear(1)}`)).toBeInTheDocument();
        expect(screen.getByText(`10/${getYear(-1)}`)).toBeInTheDocument();
    });

    it('renders list of account instruments in table format', () => {
        render(
            <ManageInstrumentsModalTest
                {...defaultProps}
                instruments={getInstruments().filter(isAccountInstrument)}
            />,
        );

        expect(screen.getByText('Manage stored payment methods')).toBeInTheDocument();
        expect(screen.getAllByText('Delete')).toHaveLength(2);
        expect(screen.getByText('test@external-id.com')).toBeInTheDocument();
        expect(screen.getByText('test@external-id-2.com')).toBeInTheDocument();
    });

    it('renders list of bank instruments in table format', () => {
        render(
            <ManageInstrumentsModalTest
                {...defaultProps}
                instruments={getInstruments().filter(isBankAccountInstrument)}
            />,
        );

        expect(screen.getByText('Manage stored payment methods')).toBeInTheDocument();
        expect(screen.getAllByText('Delete')).toHaveLength(2);
        expect(screen.getByText('ABC')).toBeInTheDocument();
        expect(screen.getByText('GHI')).toBeInTheDocument();
    });

    it('only render modal if configured to do so', () => {
        render(<ManageInstrumentsModalTest {...defaultProps} isOpen={false} />);

        // eslint-disable-next-line testing-library/no-node-access
        expect(document.querySelector('.ReactModalPortal')).toBeInTheDocument();

    });

    it('shows confirmation message before deleting instrument', async () => {
        render(<ManageInstrumentsModalTest {...defaultProps} />);

        await userEvent.click(screen.getAllByText('Delete')[0]);

        expect(await screen.findByText(localeContext.language.translate('payment.instrument_manage_modal_confirmation_label'))).toBeInTheDocument();
    });

    it.skip('shows list of instruments if user decides to cancel their action', async () => {
        render(<ManageInstrumentsModalTest {...defaultProps} />);

        await userEvent.click(screen.getAllByText('Delete')[0]);
        await userEvent.click(screen.getByText('Cancel'));
        await userEvent.click(screen.getAllByText('Delete')[0]);
        await userEvent.click(screen.getByText('Cancel'));

        expect(screen.getByText('Manage stored payment methods')).toBeInTheDocument();
        expect(screen.getAllByText('Delete')).toHaveLength(2);
        expect(screen.getByText(`02/${getYear(1)}`)).toBeInTheDocument();
        expect(screen.getByText(`10/${getYear(-1)}`)).toBeInTheDocument();
    });

    it('displays error message to user if unable to delete instrument', () => {
        jest.spyOn(checkoutState.errors, 'getDeleteInstrumentError').mockReturnValue({
            status: 500,
        } as RequestError);

        render(<ManageInstrumentsModalTest {...defaultProps} />);

        expect(screen.getByText(/There was an error/)).toBeInTheDocument();
    });
});
