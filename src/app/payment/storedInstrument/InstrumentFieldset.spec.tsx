import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { CreditCardCodeField, CreditCardNumberField } from '../creditCard';
import { getPaymentMethod } from '../payment-methods.mock';

import { getInstruments } from './instruments.mock';
import InstrumentFieldset, { InstrumentFieldsetProps, InstrumentFieldsetValues } from './InstrumentFieldset';
import InstrumentSelect from './InstrumentSelect';

describe('InstrumentFieldset', () => {
    let defaultProps: InstrumentFieldsetProps;
    let localeContext: LocaleContextType;
    let initialValues: InstrumentFieldsetValues;

    beforeEach(() => {
        defaultProps = {
            instruments: getInstruments(),
            method: getPaymentMethod(),
            onSelectInstrument: jest.fn(),
            onUseNewInstrument: jest.fn(),
            selectedInstrumentId: '123',
            shouldShowCardCodeField: false,
            shouldShowNumberField: false,
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

    it('shows card number field if configured', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <InstrumentFieldset
                        { ...defaultProps }
                        shouldShowNumberField={ true }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find(CreditCardNumberField).length)
            .toEqual(1);
    });

    it('shows card code field if configured', () => {
        const component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ initialValues }
                    onSubmit={ noop }
                >
                    <InstrumentFieldset
                        { ...defaultProps }
                        shouldShowCardCodeField={ true }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find(CreditCardCodeField).length)
            .toEqual(1);
    });
});
