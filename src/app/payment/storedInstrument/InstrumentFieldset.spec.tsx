import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { getPaymentMethod } from '../payment-methods.mock';

import { getInstruments } from './instruments.mock';
import isCardInstrument from './isCardInstrument';
import InstrumentFieldset, { InstrumentFieldsetProps, InstrumentFieldsetValues } from './InstrumentFieldset';
import InstrumentSelect from './InstrumentSelect';

describe('InstrumentFieldset', () => {
    let defaultProps: InstrumentFieldsetProps;
    let localeContext: LocaleContextType;
    let initialValues: InstrumentFieldsetValues;

    beforeEach(() => {
        defaultProps = {
            instruments: getInstruments().filter(isCardInstrument),
            method: getPaymentMethod(),
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
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <InstrumentFieldset { ...defaultProps } />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find(InstrumentSelect).length)
            .toEqual(1);
    });

    it('shows the validation form when an instrument is selected', () => {
        const ValidateInstrument = () => <span>test</span>;

        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <InstrumentFieldset
                        { ...defaultProps }
                        validateInstrument={ <ValidateInstrument /> }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find(ValidateInstrument).length)
            .toEqual(1);
    });

    it('shows the validation form when an instrument is selected', () => {
        const ValidateInstrument = () => <span>test</span>;

        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <InstrumentFieldset
                        { ...defaultProps }
                        selectedInstrumentId={ undefined }
                        validateInstrument={ <ValidateInstrument /> }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find(ValidateInstrument).length)
            .toEqual(0);
    });
});
