import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../../config/config.mock';

import AccountInstrumentFieldset, {
    AccountInstrumentFieldsetProps,
    AccountInstrumentFieldsetValues,
} from './AccountInstrumentFieldset';
import AccountInstrumentSelect from './AccountInstrumentSelect';
import { getInstruments } from './instruments.mock';
import isAccountInstrument from './isAccountInstrument';

describe('AccountInstrumentFieldset', () => {
    let defaultProps: AccountInstrumentFieldsetProps;
    let localeContext: LocaleContextType;
    let initialValues: AccountInstrumentFieldsetValues;

    beforeEach(() => {
        const instruments = getInstruments().filter(isAccountInstrument);

        defaultProps = {
            instruments,
            onSelectInstrument: jest.fn(),
            onUseNewInstrument: jest.fn(),
            selectedInstrument: instruments[0],
        };

        initialValues = {
            instrumentId: '',
        };

        localeContext = createLocaleContext(getStoreConfig());
    });

    it('shows instrument dropdown', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <AccountInstrumentFieldset {...defaultProps} />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find(AccountInstrumentSelect)).toHaveLength(1);
    });

    it('shows the new address message when the list of instruments is empty', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <AccountInstrumentFieldset {...defaultProps} instruments={[]} />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find('.instrumentSelect-note')).toHaveLength(1);
    });

    it('shows the dropdown when the list of instruments is empty', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <AccountInstrumentFieldset {...defaultProps} instruments={[]} />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find(AccountInstrumentSelect)).toHaveLength(1);
    });
});
