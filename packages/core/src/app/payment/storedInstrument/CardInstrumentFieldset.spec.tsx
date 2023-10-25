import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CardInstrumentFieldsetValues } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../../config/config.mock';

import CardInstrumentFieldset, { CardInstrumentFieldsetProps } from './CardInstrumentFieldset';
import { getInstruments } from './instruments.mock';
import InstrumentSelect from './InstrumentSelect';
import isCardInstrument from './isCardInstrument';

describe('CardInstrumentFieldset', () => {
    let defaultProps: CardInstrumentFieldsetProps;
    let localeContext: LocaleContextType;
    let initialValues: CardInstrumentFieldsetValues;

    beforeEach(() => {
        defaultProps = {
            instruments: getInstruments().filter(isCardInstrument),
            onSelectInstrument: jest.fn(),
            onUseNewInstrument: jest.fn(),
            selectedInstrumentId: '123',
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
                    <CardInstrumentFieldset {...defaultProps} />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find(InstrumentSelect)).toHaveLength(1);
    });

    it('shows the validation form when an instrument is selected', () => {
        const ValidateInstrument = () => <span>test</span>;

        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CardInstrumentFieldset
                        {...defaultProps}
                        validateInstrument={<ValidateInstrument />}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find(ValidateInstrument)).toHaveLength(1);
    });

    it('shows the validation form when an instrument is selected', () => {
        const ValidateInstrument = () => <span>test</span>;

        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CardInstrumentFieldset
                        {...defaultProps}
                        selectedInstrumentId={undefined}
                        validateInstrument={<ValidateInstrument />}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(component.find(ValidateInstrument)).toHaveLength(1);
    });
});
