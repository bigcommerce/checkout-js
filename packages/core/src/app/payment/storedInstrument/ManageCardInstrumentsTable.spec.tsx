import { mount, render } from 'enzyme';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../../config/config.mock';
import { LoadingOverlay } from '../../ui/loading';

import { getInstruments } from './instruments.mock';
import ManageCardInstrumentsTable, {
    ManageCardInstrumentsTableProps,
} from './ManageCardInstrumentsTable';

import { isCardInstrument } from '.';

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

    it('matches snapshot with rendered output', () => {
        const component = render(
            <LocaleContext.Provider value={localeContext}>
                <ManageCardInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        expect(component).toMatchSnapshot();
    });

    it('renders instrument as row in table', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <ManageCardInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        expect(component.find('[data-test="manage-instrument-cardType"]').at(0).text()).toBe(
            'VisaVisa',
        );

        expect(component.find('[data-test="manage-instrument-last4"]').at(0).text()).toBe('4321');

        expect(component.find('[data-test="manage-instrument-expiry"]').at(0).text()).toBe(
            '02/2025',
        );
    });

    it('triggers callback when delete button is clicked', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <ManageCardInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        component.find('[data-test="manage-instrument-delete-button"]').at(1).simulate('click');

        expect(defaultProps.onDeleteInstrument).toHaveBeenCalledWith(
            defaultProps.instruments[1].bigpayToken,
        );
    });

    it('renders message if there are no available instruments', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <ManageCardInstrumentsTable {...defaultProps} instruments={[]} />
            </LocaleContext.Provider>,
        );

        expect(component.text()).toEqual(
            localeContext.language.translate('payment.instrument_manage_modal_empty_text'),
        );
    });

    it('shows loading overlay when deleting', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <ManageCardInstrumentsTable {...defaultProps} isDeletingInstrument={true} />
            </LocaleContext.Provider>,
        );

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(true);
    });
});
