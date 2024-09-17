import {
    CardInstrument,
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    RequestError,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../../config/config.mock';
import { Modal } from '../../ui/modal';

import { getInstruments } from './instruments.mock';
import isAccountInstrument from './isAccountInstrument';
import isBankAccountInstrument from './isBankAccountInstrument';
import isCardInstrument from './isCardInstrument';
import ManageAccountInstrumentsTable from './ManageAccountInstrumentsTable';
import ManageCardInstrumentsTable from './ManageCardInstrumentsTable';
import ManageInstrumentsAlert from './ManageInstrumentsAlert';
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

    it('renders list of card instruments in table format', () => {
        const component = mount(
            <ManageInstrumentsModalTest
                {...defaultProps}
                instruments={getInstruments().filter(isCardInstrument)}
            />,
        );

        expect(component.find(ManageCardInstrumentsTable)).toHaveLength(1);

        expect(component.find(ManageAccountInstrumentsTable)).toHaveLength(0);
    });

    it('renders list of account instruments in table format', () => {
        const component = mount(
            <ManageInstrumentsModalTest
                {...defaultProps}
                instruments={getInstruments().filter(isAccountInstrument)}
            />,
        );

        expect(component.find(ManageAccountInstrumentsTable)).toHaveLength(1);

        expect(component.find(ManageCardInstrumentsTable)).toHaveLength(0);
    });

    it('renders list of bank instruments in table format', () => {
        const component = mount(
            <ManageInstrumentsModalTest
                {...defaultProps}
                instruments={getInstruments().filter(isBankAccountInstrument)}
            />,
        );

        expect(component.find(ManageAccountInstrumentsTable)).toHaveLength(1);

        expect(component.find(ManageCardInstrumentsTable)).toHaveLength(0);
    });

    it('only render modal if configured to do so', () => {
        const component = mount(<ManageInstrumentsModalTest {...defaultProps} isOpen={false} />);

        expect(component.find(Modal).prop('isOpen')).toBe(false);
    });

    it('shows confirmation message before deleting instrument', () => {
        const component = mount(<ManageInstrumentsModalTest {...defaultProps} />);

        component.find('[data-test="manage-instrument-delete-button"]').at(0).simulate('click');

        expect(component.find('[data-test="modal-body"]').text()).toEqual(
            localeContext.language.translate('payment.instrument_manage_modal_confirmation_label'),
        );
    });

    it('deletes selected instrument and closes modal if user confirms their action', async () => {
        jest.spyOn(checkoutService, 'deleteInstrument').mockResolvedValue(checkoutState);

        const component = mount(<ManageInstrumentsModalTest {...defaultProps} />);

        component.find('[data-test="manage-instrument-delete-button"]').at(0).simulate('click');

        component.find('[data-test="manage-instrument-confirm-button"]').simulate('click');

        expect(checkoutService.deleteInstrument).toHaveBeenCalledWith(instruments[0].bigpayToken);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onRequestClose).toHaveBeenCalled();
    });

    it('shows list of instruments if user decides to cancel their action', () => {
        const component = mount(<ManageInstrumentsModalTest {...defaultProps} />);

        component.find('[data-test="manage-instrument-delete-button"]').at(0).simulate('click');

        component.find('[data-test="manage-instrument-cancel-button"]').simulate('click');

        expect(component.find(ManageCardInstrumentsTable)).toHaveLength(1);
    });

    it('cancels "delete confirmation" screen when modal is re-open', () => {
        jest.spyOn(checkoutService, 'deleteInstrument').mockResolvedValue(checkoutState);

        const component = mount(<ManageInstrumentsModalTest {...defaultProps} />);

        component.find('[data-test="manage-instrument-delete-button"]').at(0).simulate('click');

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        component.find(Modal).prop('onAfterOpen')!();

        component.update();

        expect(component.find(ManageCardInstrumentsTable)).toHaveLength(1);
    });

    it('displays error message to user if unable to delete instrument', () => {
        jest.spyOn(checkoutState.errors, 'getDeleteInstrumentError').mockReturnValue({
            status: 500,
        } as RequestError);

        const component = mount(<ManageInstrumentsModalTest {...defaultProps} />);

        expect(component.find(ManageInstrumentsAlert)).toHaveLength(1);
    });
});
