import { mount, render } from 'enzyme';
import React from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { getInstruments, getStoreConfig } from '@bigcommerce/checkout/test-utils';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

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
        const component = render(
            <LocaleContext.Provider value={localeContext}>
                <ManageBraintreeInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        expect(component).toMatchSnapshot();
    });

    it('renders instrument as row in table', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <ManageBraintreeInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        expect(component.find('[data-test="manage-instrument-accountNumber"]').at(0).text()).toBe(
            '0000',
        );
    });

    it('triggers callback when delete button is clicked', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <ManageBraintreeInstrumentsTable {...defaultProps} />
            </LocaleContext.Provider>,
        );

        component.find('[data-test="manage-instrument-delete-button"]').at(0).simulate('click');

        expect(defaultProps.onDeleteInstrument).toHaveBeenCalledWith(
            defaultProps.instruments[0].bigpayToken,
        );
    });

    it('renders message if there are no available instruments', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <ManageBraintreeInstrumentsTable {...defaultProps} instruments={[]} />
            </LocaleContext.Provider>,
        );

        expect(component.text()).toEqual(
            localeContext.language.translate('payment.instrument_manage_modal_empty_text'),
        );
    });

    it('shows loading overlay when deleting', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <ManageBraintreeInstrumentsTable {...defaultProps} isDeletingInstrument={true} />
            </LocaleContext.Provider>,
        );

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(true);
    });
});
